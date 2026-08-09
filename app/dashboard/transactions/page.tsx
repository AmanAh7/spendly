import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TransactionsManager } from "@/components/transactions/transactions-manager";

const PAGE_SIZE = 10;

const transactionTypeValues = ["all", "income", "expense"] as const;

const sortValues = [
  "date-desc",
  "date-asc",
  "amount-desc",
  "amount-asc",
  "description-asc",
] as const;

type TransactionType = (typeof transactionTypeValues)[number];
type TransactionSort = (typeof sortValues)[number];

type TransactionsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    sort?: string;
  }>;
};

type TransactionRow = {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: Prisma.Decimal;
  date: string;
  notes: string | null;
  classification: string | null;
  paymentMethod: string | null;
  createdAt: string;
};

function getTransactionType(value: string | undefined): TransactionType {
  return transactionTypeValues.includes(value as TransactionType)
    ? (value as TransactionType)
    : "all";
}

function getTransactionSort(value: string | undefined): TransactionSort {
  return sortValues.includes(value as TransactionSort)
    ? (value as TransactionSort)
    : "date-desc";
}

function getOrderClause(sort: TransactionSort) {
  switch (sort) {
    case "date-asc":
      return Prisma.raw(`"date" ASC, "created_at" ASC`);
    case "amount-desc":
      return Prisma.raw(`"amount" DESC, "date" DESC`);
    case "amount-asc":
      return Prisma.raw(`"amount" ASC, "date" DESC`);
    case "description-asc":
      return Prisma.raw(`"description" ASC, "date" DESC`);
    case "date-desc":
    default:
      return Prisma.raw(`"date" DESC, "created_at" DESC`);
  }
}

function buildTypeCondition(type: TransactionType) {
  if (type === "income" || type === "expense") {
    return Prisma.sql`AND "type" = ${type}`;
  }

  return Prisma.empty;
}

function buildSearchCondition(search: string) {
  if (!search) {
    return Prisma.empty;
  }

  const searchPattern = `%${search}%`;

  return Prisma.sql`
    AND (
      "description" ILIKE ${searchPattern}
      OR COALESCE("notes", '') ILIKE ${searchPattern}
    )
  `;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const userId = session.user.id;

  const pageValue = Number.parseInt(params.page ?? "1", 10);
  const requestedPage =
    Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;

  const search = params.search?.trim() ?? "";
  const type = getTransactionType(params.type);
  const sort = getTransactionSort(params.sort);

  const typeCondition = buildTypeCondition(type);
  const searchCondition = buildSearchCondition(search);
  const orderClause = getOrderClause(sort);

  const combinedTransactionsSql = Prisma.sql`
    SELECT
      "id",
      "type",
      "description",
      "amount",
      "date",
      "notes",
      "classification",
      "payment_method",
      "created_at"
    FROM (
      SELECT
        e."id" AS "id",
        'expense'::text AS "type",
        e."description" AS "description",
        e."amount"::numeric AS "amount",
        e."date"::text AS "date",
        e."notes" AS "notes",
        c."name" AS "classification",
        e."paymentMethod"::text AS "payment_method",
        e."createdAt"::text AS "created_at",
        e."userId" AS "user_id"
      FROM "Expense" e
      INNER JOIN "Category" c ON c."id" = e."categoryId"
      WHERE e."userId" = ${userId}

      UNION ALL

      SELECT
        i."id" AS "id",
        'income'::text AS "type",
        i."description" AS "description",
        i."amount"::numeric AS "amount",
        i."date"::text AS "date",
        i."notes" AS "notes",
        i."source"::text AS "classification",
        NULL::text AS "payment_method",
        i."createdAt"::text AS "created_at",
        i."userId" AS "user_id"
      FROM "Income" i
      WHERE i."userId" = ${userId}
    ) combined
    WHERE TRUE
    ${typeCondition}
    ${searchCondition}
  `;

  const [user, countResult] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        currency: true,
      },
    }),

    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS "count"
      FROM (${combinedTransactionsSql}) combined_count
    `,
  ]);

  if (!user) {
    redirect("/login");
  }

  const totalCount = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(requestedPage, totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;

  const transactions = await prisma.$queryRaw<TransactionRow[]>`
    SELECT
      "id",
      "type",
      "description",
      "amount",
      "date",
      "notes",
      "classification",
      "payment_method",
      "created_at"
    FROM (${combinedTransactionsSql}) combined_transactions
    ORDER BY ${orderClause}
    LIMIT ${PAGE_SIZE}
    OFFSET ${offset}
  `;

  const serializedTransactions = transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    description: transaction.description,
    amount: Number(transaction.amount.toString()),
    date: transaction.date,
    notes: transaction.notes,
    classification: transaction.classification,
    paymentMethod: transaction.paymentMethod,
  }));

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TransactionsManager
          transactions={serializedTransactions}
          currency={user.currency}
          page={safePage}
          totalPages={totalPages}
          totalCount={totalCount}
          search={search}
          type={type}
          sort={sort}
        />
      </div>
    </main>
  );
}
