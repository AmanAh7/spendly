import { Prisma, PaymentMethod } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExpenseManager } from "@/components/expenses/expense-manager";
import { paymentMethodValues } from "@/lib/validators/expense";
import { ensureDefaultCategories } from "@/lib/default-categories";

const PAGE_SIZE = 10;

type ExpensesPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    paymentMethod?: string;
    sort?: string;
  }>;
};

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const userId = session.user.id;

  await ensureDefaultCategories(userId);

  const pageValue = Number.parseInt(params.page ?? "1", 10);

  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;

  const search = params.search?.trim() ?? "";
  const categoryId = params.categoryId ?? "";

  const paymentMethod = paymentMethodValues.includes(
    params.paymentMethod as (typeof paymentMethodValues)[number],
  )
    ? (params.paymentMethod ?? "")
    : "";

  const sort = [
    "date-desc",
    "date-asc",
    "amount-desc",
    "amount-asc",
    "description-asc",
  ].includes(params.sort ?? "")
    ? (params.sort ?? "date-desc")
    : "date-desc";

  const where: Prisma.ExpenseWhereInput = {
    userId,
  };

  if (search) {
    where.OR = [
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        notes: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        category: {
          name: {
            contains: search,
            mode: "insensitive",
          },
          userId,
        },
      },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (paymentMethod) {
    where.paymentMethod = paymentMethod as PaymentMethod;
  }

  const orderBy: Prisma.ExpenseOrderByWithRelationInput =
    sort === "date-asc"
      ? { date: "asc" }
      : sort === "amount-desc"
        ? { amount: "desc" }
        : sort === "amount-asc"
          ? { amount: "asc" }
          : sort === "description-asc"
            ? { description: "asc" }
            : { date: "desc" };

  const [user, categories, totalCount, expenses] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        currency: true,
      },
    }),

    prisma.category.findMany({
      where: {
        userId,
        type: {
          in: ["EXPENSE", "BOTH"],
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    }),

    prisma.expense.count({
      where,
    }),

    prisma.expense.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        amount: true,
        description: true,
        paymentMethod: true,
        date: true,
        notes: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const serializedExpenses = expenses.map((expense) => ({
    id: expense.id,
    amount: Number(expense.amount.toString()),
    description: expense.description,
    paymentMethod: expense.paymentMethod,
    date: expense.date.toISOString(),
    notes: expense.notes,
    category: expense.category,
  }));

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ExpenseManager
          expenses={serializedExpenses}
          categories={categories}
          currency={user.currency}
          page={safePage}
          totalPages={totalPages}
          totalCount={totalCount}
          search={search}
          categoryId={categoryId}
          paymentMethod={paymentMethod}
          sort={sort}
        />
      </div>
    </main>
  );
}
