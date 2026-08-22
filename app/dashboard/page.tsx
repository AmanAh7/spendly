import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Goal,
  PiggyBank,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dateFormatValues, formatCurrency, formatDate } from "@/lib/format";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { BudgetCarousel } from "@/components/dashboard/budget-carousel";
import { GoalCarousel } from "@/components/dashboard/goal-carousel";
import { cn } from "@/lib/utils";

type TransactionItem = {
  id: string;
  description: string;
  date: Date;
  amount: number;
  type: "income" | "expense";
  category: string;
};

type SerializedBudget = {
  id: string;
  name: string;
  typeLabel: string;
  amount: number;
  spent: number;
  remaining: number;
  usage: number;
  exceededAmount: number;
};

type SerializedGoal = {
  id: string;
  name: string;
  categoryName: string | null;
  targetAmount: number;
  saved: number;
  remaining: number;
  progress: number;
  targetDate: string | null;
};

function decimalToNumber(value: Prisma.Decimal | null | undefined) {
  return value ? Number(value.toString()) : 0;
}

function percentage(value: number) {
  return `${Math.round(value)}%`;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const chartStart = startOfMonth(subMonths(monthStart, 5));
  const chartEnd = monthEnd;

  const [
    user,
    currentExpenseAggregate,
    currentIncomeAggregate,
    monthlyExpenses,
    monthlyIncome,
    budgets,
    categorySpendGroups,
    recentExpenses,
    recentIncome,
    activeGoals,
    upcomingRecurring,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        currency: true,
        dateFormat: true,
      },
    }),

    prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),

    prisma.income.aggregate({
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),

    prisma.expense.findMany({
      where: {
        userId,
        date: { gte: chartStart, lte: chartEnd },
      },
      select: { amount: true, date: true },
    }),

    prisma.income.findMany({
      where: {
        userId,
        date: { gte: chartStart, lte: chartEnd },
      },
      select: { amount: true, date: true },
    }),

    prisma.budget.findMany({
      where: {
        userId,
        periodStart: { lte: today },
        periodEnd: { gte: today },
      },
      select: {
        id: true,
        name: true,
        amount: true,
        categoryId: true,
        periodStart: true,
        periodEnd: true,
        category: { select: { name: true } },
      },
      orderBy: { amount: "desc" },
    }),

    prisma.expense.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),

    prisma.expense.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        description: true,
        date: true,
        amount: true,
        category: { select: { name: true } },
      },
    }),

    prisma.income.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        description: true,
        date: true,
        amount: true,
      },
    }),

    prisma.goal.findMany({
      where: { userId, completedAt: null },
      orderBy: [{ targetDate: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        targetAmount: true,
        targetDate: true,
        category: {
          select: {
            name: true,
          },
        },
        contributions: { select: { amount: true } },
      },
    }),

    prisma.recurringExpense.findMany({
      where: {
        userId,
        isActive: true,
        nextDueDate: { gte: now },
      },
      orderBy: { nextDueDate: "asc" },
      take: 5,
      select: {
        id: true,
        description: true,
        amount: true,
        nextDueDate: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const currency = user.currency;
  const dateFormat = dateFormatValues.includes(
    user.dateFormat as (typeof dateFormatValues)[number],
  )
    ? user.dateFormat
    : "DD/MM/YYYY";
  const currentExpensesTotal = decimalToNumber(
    currentExpenseAggregate._sum.amount,
  );

  const currentIncomeTotal = decimalToNumber(
    currentIncomeAggregate._sum.amount,
  );

  const balance = currentIncomeTotal - currentExpensesTotal;

  const overallBudget = budgets
    .filter((budget) => budget.categoryId === null)
    .reduce<(typeof budgets)[number] | null>((selected, budget) => {
      if (!selected) {
        return budget;
      }

      if (budget.periodStart > selected.periodStart) {
        return budget;
      }

      if (
        budget.periodStart.getTime() === selected.periodStart.getTime() &&
        budget.amount.greaterThan(selected.amount)
      ) {
        return budget;
      }

      return selected;
    }, null);

  const overallBudgetExpenses = overallBudget
    ? await prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: overallBudget.periodStart,
            lte: overallBudget.periodEnd,
          },
        },
        select: { amount: true },
      })
    : [];

  const activeBudgetExpenses = budgets.length
    ? await prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: budgets.reduce(
              (earliest, budget) =>
                budget.periodStart < earliest ? budget.periodStart : earliest,
              budgets[0].periodStart,
            ),
            lte: budgets.reduce(
              (latest, budget) =>
                budget.periodEnd > latest ? budget.periodEnd : latest,
              budgets[0].periodEnd,
            ),
          },
        },
        select: {
          amount: true,
          date: true,
          categoryId: true,
        },
      })
    : [];

  const totalBudget = overallBudget ? decimalToNumber(overallBudget.amount) : 0;

  const overallBudgetExpensesTotal = overallBudgetExpenses.reduce(
    (total, expense) => total + decimalToNumber(expense.amount),
    0,
  );

  const budgetUsage =
    totalBudget > 0 ? (overallBudgetExpensesTotal / totalBudget) * 100 : 0;

  const exceededAmount =
    totalBudget > 0 ? Math.max(overallBudgetExpensesTotal - totalBudget, 0) : 0;

  const orderedBudgets = [
    ...budgets.filter((budget) => budget.categoryId === null),
    ...budgets.filter((budget) => budget.categoryId !== null),
  ];

  const serializedBudgets: SerializedBudget[] = orderedBudgets.map((budget) => {
    const spent = activeBudgetExpenses
      .filter(
        (expense) =>
          expense.date >= budget.periodStart &&
          expense.date <= budget.periodEnd &&
          (!budget.categoryId || expense.categoryId === budget.categoryId),
      )
      .reduce((total, expense) => total + decimalToNumber(expense.amount), 0);

    const amount = decimalToNumber(budget.amount);
    const remaining = Math.max(amount - spent, 0);
    const usage = amount > 0 ? (spent / amount) * 100 : 0;
    const exceeded = Math.max(spent - amount, 0);

    return {
      id: budget.id,
      name: budget.name,
      typeLabel: budget.category?.name ?? "Overall budget",
      amount,
      spent,
      remaining,
      usage,
      exceededAmount: exceeded,
    };
  });

  const savingsRate =
    currentIncomeTotal > 0 ? (balance / currentIncomeTotal) * 100 : 0;

  const categoryIds = categorySpendGroups.map((group) => group.categoryId);

  const categoryRecords = await prisma.category.findMany({
    where: {
      userId,
      id: { in: categoryIds },
    },
    select: { id: true, name: true, color: true },
  });

  const categoryMap = new Map(
    categoryRecords.map((category) => [category.id, category]),
  );

  const topCategories = categorySpendGroups.map((group) => {
    const category = categoryMap.get(group.categoryId);

    return {
      id: group.categoryId,
      name: category?.name ?? "Unknown",
      color: category?.color ?? "#8B5CF6",
      amount: decimalToNumber(group._sum.amount),
    };
  });

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const month = startOfMonth(subMonths(monthStart, 5 - index));
    const nextMonth = endOfMonth(month);

    const expenses = monthlyExpenses
      .filter((expense) => expense.date >= month && expense.date <= nextMonth)
      .reduce((total, expense) => total + decimalToNumber(expense.amount), 0);

    const income = monthlyIncome
      .filter(
        (incomeItem) =>
          incomeItem.date >= month && incomeItem.date <= nextMonth,
      )
      .reduce(
        (total, incomeItem) => total + decimalToNumber(incomeItem.amount),
        0,
      );

    return {
      month: format(month, "MMM"),
      income,
      expenses,
    };
  });

  const transactions: TransactionItem[] = [
    ...recentExpenses.map((expense) => ({
      id: expense.id,
      description: expense.description,
      date: expense.date,
      amount: decimalToNumber(expense.amount),
      type: "expense" as const,
      category: expense.category.name,
    })),

    ...recentIncome.map((incomeItem) => ({
      id: incomeItem.id,
      description: incomeItem.description,
      date: incomeItem.date,
      amount: decimalToNumber(incomeItem.amount),
      type: "income" as const,
      category: "Income",
    })),
  ]
    .sort((first, second) => second.date.getTime() - first.date.getTime())
    .slice(0, 6);

  const serializedGoals: SerializedGoal[] = activeGoals.map((goal) => {
    const saved = goal.contributions.reduce(
      (total, contribution) => total + decimalToNumber(contribution.amount),
      0,
    );

    const targetAmount = decimalToNumber(goal.targetAmount);
    const remaining = Math.max(targetAmount - saved, 0);
    const progress = targetAmount > 0 ? (saved / targetAmount) * 100 : 0;

    return {
      id: goal.id,
      name: goal.name,
      categoryName: goal.category?.name ?? null,
      targetAmount,
      saved,
      remaining,
      progress,
      targetDate: goal.targetDate
        ? goal.targetDate.toISOString().slice(0, 10)
        : null,
    };
  });

  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-muted-foreground">
              {format(now, "EEEE, d MMMM yyyy")}
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Good morning, {firstName}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Here&apos;s your financial overview for {format(now, "MMMM yyyy")}
              .
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/expenses"
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ReceiptText className="h-4 w-4" />
              View expenses
            </Link>

            <Link
              href="/dashboard/income"
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowUpRight className="h-4 w-4" />
              Add income
            </Link>

            <Link
              href="/dashboard/expenses/new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <CircleDollarSign className="h-4 w-4" />
              Add expense
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Monthly income"
            value={formatCurrency(currentIncomeTotal, currency)}
            detail={`${format(now, "MMMM")} income`}
            icon={<ArrowUpRight className="h-5 w-5" />}
            tone="green"
          />

          <SummaryCard
            title="Monthly expenses"
            value={formatCurrency(currentExpensesTotal, currency)}
            detail={`${format(now, "MMMM")} expenses`}
            icon={<ArrowDownRight className="h-5 w-5" />}
            tone="violet"
          />

          <SummaryCard
            title="Current balance"
            value={formatCurrency(balance, currency)}
            detail={`${savingsRate.toFixed(1)}% savings rate`}
            icon={<WalletCards className="h-5 w-5" />}
            tone={balance >= 0 ? "blue" : "red"}
          />

          <SummaryCard
            title="Budget usage"
            value={totalBudget > 0 ? percentage(budgetUsage) : "Not set"}
            detail={
              totalBudget > 0
                ? exceededAmount > 0
                  ? `${formatCurrency(exceededAmount, currency)} over budget`
                  : `${formatCurrency(
                      overallBudgetExpensesTotal,
                      currency,
                    )} of ${formatCurrency(totalBudget, currency)}`
                : "Create your first overall budget"
            }
            icon={<PiggyBank className="h-5 w-5" />}
            tone={
              budgetUsage >= 100 ? "red" : budgetUsage >= 75 ? "purple" : "blue"
            }
          />
        </section>

        <DashboardCharts
          monthlyData={monthlyData}
          currency={
            currency === "USD" || currency === "EUR" || currency === "GBP"
              ? currency
              : "INR"
          }
        />

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="glass-panel-strong rounded-3xl p-5 xl:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">
                  Top spending categories
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Based on your expenses this month.
                </p>
              </div>

              <TrendingUp className="h-5 w-5 text-primary" />
            </div>

            {topCategories.length > 0 ? (
              <div className="mt-6 space-y-5">
                {topCategories.map((category) => {
                  const share =
                    currentExpensesTotal > 0
                      ? (category.amount / currentExpensesTotal) * 100
                      : 0;

                  return (
                    <div key={category.id}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />

                          <span className="truncate">{category.name}</span>
                        </div>

                        <span className="shrink-0 font-medium">
                          {formatCurrency(category.amount, currency)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                        {/* Inline styles required: width and color are dynamic per-category values */}
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(share, 100)}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No spending data yet"
                description="Add your first expense to see category insights."
                href="/dashboard/expenses"
                linkLabel="View expenses"
              />
            )}
          </div>

          <div className="glass-panel-strong rounded-3xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Budget status</h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Active overall and category budgets.
                </p>
              </div>

              <PiggyBank className="h-5 w-5 text-primary" />
            </div>

            {serializedBudgets.length > 0 ? (
              <BudgetCarousel budgets={serializedBudgets} currency={currency} />
            ) : (
              <EmptyState
                title="No active budget set"
                description="Set an overall or category budget to track spending progress."
                href="/dashboard/budgets"
                linkLabel="Create budget"
              />
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="glass-panel-strong rounded-3xl p-5 xl:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Recent transactions</h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your latest income and expenses.
                </p>
              </div>

              <Link
                href="/dashboard/transactions"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {transactions.length > 0 ? (
              <div className="mt-5 divide-y divide-border/50">
                {transactions.map((transaction) => (
                  <div
                    key={`${transaction.type}-${transaction.id}`}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          transaction.type === "income"
                            ? "bg-success/15 text-success"
                            : "bg-primary/15 text-primary",
                        )}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {transaction.description}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {transaction.category} ·{" "}
                          {formatDate(transaction.date, dateFormat)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold",
                        transaction.type === "income"
                          ? "text-success"
                          : "text-foreground",
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No transactions yet"
                description="Your recent activity will appear here."
                href="/dashboard/expenses"
                linkLabel="Add an expense"
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-panel-strong rounded-3xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">Financial goal</h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Keep moving toward your target.
                  </p>
                </div>

                <Goal className="h-5 w-5 text-primary" />
              </div>

              {serializedGoals.length > 0 ? (
                <GoalCarousel
                  goals={serializedGoals}
                  currency={currency}
                  dateFormat={dateFormat}
                />
              ) : (
                <EmptyState
                  title="No active goal"
                  description="Create a goal for something important."
                  href="/dashboard/goals"
                  linkLabel="Create goal"
                />
              )}
            </div>

            <div className="glass-panel-strong rounded-3xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">Upcoming payments</h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Active recurring expenses.
                  </p>
                </div>

                <CalendarClock className="h-5 w-5 text-primary" />
              </div>

              {upcomingRecurring.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {upcomingRecurring.map((recurring) => (
                    <div
                      key={recurring.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {recurring.description}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {recurring.category.name} ·{" "}
                          {formatDate(recurring.nextDueDate, dateFormat)}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-semibold">
                        {formatCurrency(
                          decimalToNumber(recurring.amount),
                          currency,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing upcoming"
                  description="Your recurring payments will appear here."
                  href="/dashboard/recurring"
                  linkLabel="Manage recurring"
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: "green" | "violet" | "blue" | "red" | "purple";
}) {
  const toneClasses = {
    green: "bg-success/15 text-success",
    violet: "bg-primary/15 text-primary",
    blue: "bg-accent/15 text-accent",
    red: "bg-destructive/15 text-destructive",
    purple: "bg-primary/15 text-primary",
  };

  return (
    <div className="glass-panel-strong rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
        </div>

        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            toneClasses[tone],
          )}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 truncate text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border/70 p-5 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>

      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {linkLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
