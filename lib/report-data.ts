import { Prisma } from "@prisma/client";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";

export type ReportRange = "current" | "3" | "6" | "12";

export type ReportMonthlyItem = {
  month: string;
  income: number;
  expenses: number;
  net: number;
};

export type ReportCategoryItem = {
  name: string;
  color: string;
  amount: number;
};

export type ReportSourceItem = {
  name: string;
  amount: number;
};

export type ReportBudgetItem = {
  name: string;
  categoryName: string;
  amount: number;
  spent: number;
  remaining: number;
  usage: number;
};

export type ReportGoalItem = {
  name: string;
  targetAmount: number;
  saved: number;
  remaining: number;
  progress: number;
  targetDate: string | null;
  completed: boolean;
};

export type ReportTransactionItem = {
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  classification: string;
  paymentMethod: string | null;
  notes: string | null;
};

export type ReportData = {
  range: ReportRange;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  monthlyData: ReportMonthlyItem[];
  categoryData: ReportCategoryItem[];
  sourceData: ReportSourceItem[];
  budgetData: ReportBudgetItem[];
  goalData: ReportGoalItem[];
  transactions: ReportTransactionItem[];
};

function decimalToNumber(value: Prisma.Decimal | null | undefined) {
  return value ? Number(value.toString()) : 0;
}

function utcMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function utcMonthEnd(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseReportRange(value: string | undefined): ReportRange {
  if (value === "current" || value === "3" || value === "6" || value === "12") {
    return value;
  }

  return "6";
}

function rangeMonths(range: ReportRange) {
  return range === "current" ? 1 : Number(range);
}

export async function getReportData(
  userId: string,
  requestedRange?: string,
): Promise<ReportData> {
  const range = parseReportRange(requestedRange);
  const months = rangeMonths(range);
  const now = new Date();
  const currentMonthStart = utcMonthStart(now);

  const periodStart =
    range === "current"
      ? currentMonthStart
      : new Date(
          Date.UTC(
            currentMonthStart.getUTCFullYear(),
            currentMonthStart.getUTCMonth() - months + 1,
            1,
          ),
        );

  const periodEnd = utcMonthEnd(now);

  const [expenses, incomes, budgets, goals] = await Promise.all([
    prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
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

    prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        amount: true,
        description: true,
        source: {
          select: {
            id: true,
            name: true,
          },
        },
        date: true,
        notes: true,
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
      orderBy: [{ periodStart: "desc" }, { createdAt: "desc" }],
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
          },
        },
      },
    }),

    prisma.goal.findMany({
      where: {
        userId,
      },
      orderBy: [{ completedAt: "asc" }, { targetDate: "asc" }],
      select: {
        id: true,
        name: true,
        targetAmount: true,
        targetDate: true,
        completedAt: true,
        contributions: {
          select: {
            amount: true,
          },
        },
      },
    }),
  ]);

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

  const monthlyData: ReportMonthlyItem[] = Array.from(
    { length: months },
    (_, index) => {
      const month = new Date(
        Date.UTC(
          periodStart.getUTCFullYear(),
          periodStart.getUTCMonth() + index,
          1,
        ),
      );
      const monthEnd = utcMonthEnd(month);
      const key = monthKey(month);

      const income = incomes
        .filter(
          (item) =>
            monthKey(item.date) === key &&
            item.date >= month &&
            item.date <= monthEnd,
        )
        .reduce((total, item) => total + decimalToNumber(item.amount), 0);

      const expensesTotal = expenses
        .filter(
          (item) =>
            monthKey(item.date) === key &&
            item.date >= month &&
            item.date <= monthEnd,
        )
        .reduce((total, item) => total + decimalToNumber(item.amount), 0);

      return {
        month: format(month, "MMM yyyy"),
        income,
        expenses: expensesTotal,
        net: income - expensesTotal,
      };
    },
  );

  const categoryMap = new Map<string, ReportCategoryItem>();

  for (const expense of expenses) {
    const existing = categoryMap.get(expense.category.id);

    categoryMap.set(expense.category.id, {
      name: expense.category.name,
      color: expense.category.color,
      amount: (existing?.amount ?? 0) + decimalToNumber(expense.amount),
    });
  }

  const categoryData = [...categoryMap.values()].sort(
    (first, second) => second.amount - first.amount,
  );

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

  const sourceData: ReportSourceItem[] = [...sourceMap.values()]
    .sort((first, second) => second.amount - first.amount)
    .map((source) => ({
      name: source.name,
      amount: source.amount,
    }));

  const budgetData: ReportBudgetItem[] = budgets.map((budget) => {
    const spent = expenses
      .filter((expense) => {
        const insidePeriod =
          expense.date >= budget.periodStart &&
          expense.date <= budget.periodEnd;

        const matchesCategory =
          budget.categoryId === null ||
          expense.category.id === budget.categoryId;

        return insidePeriod && matchesCategory;
      })
      .reduce((total, expense) => total + decimalToNumber(expense.amount), 0);

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

  const goalData: ReportGoalItem[] = goals.map((goal) => {
    const targetAmount = decimalToNumber(goal.targetAmount);
    const saved = goal.contributions.reduce(
      (total, contribution) => total + decimalToNumber(contribution.amount),
      0,
    );

    return {
      name: goal.name,
      targetAmount,
      saved,
      remaining: Math.max(targetAmount - saved, 0),
      progress: targetAmount > 0 ? (saved / targetAmount) * 100 : 0,
      targetDate: goal.targetDate ? dateKey(goal.targetDate) : null,
      completed: Boolean(goal.completedAt),
    };
  });

  const transactions: ReportTransactionItem[] = [
    ...expenses.map((expense) => ({
      type: "expense" as const,
      description: expense.description,
      amount: decimalToNumber(expense.amount),
      date: dateKey(expense.date),
      classification: expense.category.name,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes,
    })),
    ...incomes.map((income) => ({
      type: "income" as const,
      description: income.description,
      amount: decimalToNumber(income.amount),
      date: dateKey(income.date),
      classification: income.source.name,
      paymentMethod: null,
      notes: income.notes,
    })),
  ].sort((first, second) => second.date.localeCompare(first.date));

  return {
    range,
    periodLabel:
      range === "current"
        ? format(now, "MMMM yyyy")
        : `${format(periodStart, "MMM yyyy")} – ${format(
            periodEnd,
            "MMM yyyy",
          )}`,
    periodStart,
    periodEnd,
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate,
    monthlyData,
    categoryData,
    sourceData,
    budgetData,
    goalData,
    transactions,
  };
}
