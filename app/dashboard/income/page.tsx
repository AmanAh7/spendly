import { Prisma, IncomeSource } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IncomeManager } from "@/components/income/income-manager";
import { incomeSourceValues } from "@/lib/validators/income";
import { ensureDefaultCategories } from "@/lib/default-categories";

const PAGE_SIZE = 10;

type IncomePageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    source?: string;
    sort?: string;
  }>;
};

export default async function IncomePage({ searchParams }: IncomePageProps) {
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

  const source = incomeSourceValues.includes(
    params.source as (typeof incomeSourceValues)[number],
  )
    ? (params.source ?? "")
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

  const where: Prisma.IncomeWhereInput = {
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

  if (categoryId === "none") {
    where.categoryId = null;
  } else if (categoryId) {
    where.categoryId = categoryId;
  }

  if (source) {
    where.source = source as IncomeSource;
  }

  const orderBy: Prisma.IncomeOrderByWithRelationInput =
    sort === "date-asc"
      ? { date: "asc" }
      : sort === "amount-desc"
        ? { amount: "desc" }
        : sort === "amount-asc"
          ? { amount: "asc" }
          : sort === "description-asc"
            ? { description: "asc" }
            : { date: "desc" };

  const [user, categories, totalCount, incomes] = await Promise.all([
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
          in: ["INCOME", "BOTH"],
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

    prisma.income.count({
      where,
    }),

    prisma.income.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        amount: true,
        description: true,
        source: true,
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

  const serializedIncome = incomes.map((income) => ({
    id: income.id,
    amount: Number(income.amount.toString()),
    description: income.description,
    source: income.source,
    date: income.date.toISOString(),
    notes: income.notes,
    category: income.category,
  }));

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <IncomeManager
          incomes={serializedIncome}
          categories={categories}
          currency={user.currency}
          page={safePage}
          totalPages={totalPages}
          totalCount={totalCount}
          search={search}
          categoryId={categoryId}
          source={source}
          sort={sort}
        />
      </div>
    </main>
  );
}
