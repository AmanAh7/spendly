import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BudgetManager } from "@/components/budgets/budget-manager";
import { ensureDefaultCategories } from "@/lib/default-categories";

function decimalToNumber(value: Prisma.Decimal) {
  return Number(value.toString());
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function BudgetsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  await ensureDefaultCategories(userId);

  const [user, categories, budgets, expenses] = await Promise.all([
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
        appliesToBudgets: true,
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

    prisma.budget.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          periodStart: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        amount: true,
        periodStart: true,
        periodEnd: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    }),

    prisma.expense.findMany({
      where: {
        userId,
      },
      select: {
        amount: true,
        date: true,
        categoryId: true,
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const serializedBudgets = budgets.map((budget) => {
    const spent = expenses
      .filter(
        (expense) =>
          expense.date >= budget.periodStart &&
          expense.date <= budget.periodEnd &&
          (!budget.categoryId || expense.categoryId === budget.categoryId),
      )
      .reduce((total, expense) => total + decimalToNumber(expense.amount), 0);

    const amount = decimalToNumber(budget.amount);

    return {
      id: budget.id,
      name: budget.name,
      amount,
      spent,
      remaining: amount - spent,
      usage: amount > 0 ? (spent / amount) * 100 : 0,
      periodStart: toDateKey(budget.periodStart),
      periodEnd: toDateKey(budget.periodEnd),
      category: budget.category,
    };
  });

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BudgetManager
          budgets={serializedBudgets}
          categories={categories}
          currency={user.currency}
        />
      </div>
    </main>
  );
}
