import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import type {
  AnalyticsRange,
  AnalyticsData,
  BudgetAnalyticsItem,
  CategoryAnalyticsItem,
  IncomeSourceAnalyticsItem,
  MonthlyAnalyticsItem,
} from "@/components/analytics/analytics-dashboard";

type AnalyticsPageProps = {
  searchParams: Promise<{
    range?: string;
  }>;
};

function decimalToNumber(value: Prisma.Decimal | null | undefined) {
  return value ? Number(value.toString()) : 0;
}

function getRange(value: string | undefined): AnalyticsRange {
  if (value === "current" || value === "3" || value === "6" || value === "12") {
    return value;
  }

  return "6";
}

function getRangeMonths(range: AnalyticsRange) {
  return range === "current" ? 1 : Number(range);
}

function getUtcMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function getUtcMonthEnd(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function getMonthLabel(date: Date) {
  return format(date, "MMM yyyy");
}
export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const userId = session.user.id;
  const range = getRange(params.range);
  const rangeMonths = getRangeMonths(range);

  const now = new Date();
  const currentMonthStart = getUtcMonthStart(now);
  const periodStart =
    range === "current"
      ? currentMonthStart
      : new Date(
          Date.UTC(
            currentMonthStart.getUTCFullYear(),
            currentMonthStart.getUTCMonth() - rangeMonths + 1,
            1,
          ),
        );
  const periodEnd = getUtcMonthEnd(now);

  const [user, expenses, incomes, budgets] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        currency: true,
      },
    }),

    prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        amount: true,
        date: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    }),

    prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        amount: true,
        date: true,
        source: true,
      },
    }),

    prisma.budget.findMany({
      where: {
        userId,
        periodStart: {
          lte: periodEnd,
        },
        periodEnd: {
          gte: periodStart,
        },
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
        categoryId: true,
        periodStart: true,
        periodEnd: true,
        category: {
          select: {
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

  const totalExpenses = expenses.reduce(
    (total, expense) => total + decimalToNumber(expense.amount),
    0,
  );

  const totalIncome = incomes.reduce(
    (total, income) => total + decimalToNumber(income.amount),
    0,
  );

  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

  const monthlyData: MonthlyAnalyticsItem[] = Array.from(
    { length: rangeMonths },
    (_, index) => {
      const month = new Date(
        Date.UTC(
          periodStart.getUTCFullYear(),
          periodStart.getUTCMonth() + index,
          1,
        ),
      );
      const monthEnd = getUtcMonthEnd(month);
      const monthKey = getMonthKey(month);

      const monthlyIncome = incomes
        .filter(
          (income) =>
            getMonthKey(income.date) === monthKey &&
            income.date >= month &&
            income.date <= monthEnd,
        )
        .reduce((total, income) => total + decimalToNumber(income.amount), 0);

      const monthlyExpenses = expenses
        .filter(
          (expense) =>
            getMonthKey(expense.date) === monthKey &&
            expense.date >= month &&
            expense.date <= monthEnd,
        )
        .reduce((total, expense) => total + decimalToNumber(expense.amount), 0);

      return {
        month: getMonthLabel(month),
        income: monthlyIncome,
        expenses: monthlyExpenses,
        net: monthlyIncome - monthlyExpenses,
      };
    },
  );

  const categoryMap = new Map<
    string,
    {
      name: string;
      color: string;
      amount: number;
    }
  >();

  for (const expense of expenses) {
    const current = categoryMap.get(expense.category.id);

    categoryMap.set(expense.category.id, {
      name: expense.category.name,
      color: expense.category.color,
      amount: (current?.amount ?? 0) + decimalToNumber(expense.amount),
    });
  }

  const categoryData: CategoryAnalyticsItem[] = [...categoryMap.values()]
    .sort((first, second) => second.amount - first.amount)
    .map((category) => ({
      name: category.name,
      color: category.color,
      amount: category.amount,
    }));

  const sourceMap = new Map<
    string,
    {
      name: string;
      amount: number;
    }
  >();

  for (const income of incomes) {
    const current = sourceMap.get(income.source.id);

    sourceMap.set(income.source.id, {
      name: income.source.name,
      amount: (current?.amount ?? 0) + decimalToNumber(income.amount),
    });
  }

  const sourceData: IncomeSourceAnalyticsItem[] = [...sourceMap.values()]
    .sort((first, second) => second.amount - first.amount)
    .map((source) => ({
      name: source.name,
      amount: source.amount,
    }));

  const budgetData: BudgetAnalyticsItem[] = budgets.map((budget) => {
    const budgetExpenses = expenses.filter((expense) => {
      const insideBudgetPeriod =
        expense.date >= budget.periodStart && expense.date <= budget.periodEnd;

      const matchesCategory =
        budget.categoryId === null || expense.category.id === budget.categoryId;

      return insideBudgetPeriod && matchesCategory;
    });

    const spent = budgetExpenses.reduce(
      (total, expense) => total + decimalToNumber(expense.amount),
      0,
    );

    const amount = decimalToNumber(budget.amount);

    return {
      name: budget.name,
      categoryName: budget.category?.name ?? "Overall budget",
      amount,
      spent,
      remaining: Math.max(amount - spent, 0),
      usage: amount > 0 ? (spent / amount) * 100 : 0,
    };
  });

  const data: AnalyticsData = {
    range,
    periodLabel:
      range === "current"
        ? format(now, "MMMM yyyy")
        : `${format(periodStart, "MMM yyyy")} – ${format(
            periodEnd,
            "MMM yyyy",
          )}`,
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate,
    monthlyData,
    categoryData,
    sourceData,
    budgetData,
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AnalyticsDashboard data={data} currency={user.currency} />
      </div>
    </main>
  );
}
