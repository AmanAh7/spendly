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

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

type TransactionItem = {
  id: string;
  description: string;
  date: Date;
  amount: number;
  type: "income" | "expense";
  category: string;
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
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const chartStart = startOfMonth(subMonths(monthStart, 5));
  const chartEnd = monthEnd;

  const [
    user,
    currentExpenseAggregate,
    currentIncomeAggregate,
    currentExpenses,
    monthlyExpenses,
    monthlyIncome,
    budgets,
    categorySpendGroups,
    recentExpenses,
    recentIncome,
    activeGoal,
    upcomingRecurring,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, currency: true },
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
        date: { gte: monthStart, lte: monthEnd },
      },
      select: { amount: true },
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
        periodStart: { lte: monthStart },
        periodEnd: { gte: monthEnd },
      },
      select: {
        id: true,
        name: true,
        amount: true,
        categoryId: true,
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

    prisma.goal.findFirst({
      where: { userId, completedAt: null },
      orderBy: [{ targetDate: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        targetAmount: true,
        targetDate: true,
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
  const currentExpensesTotal = decimalToNumber(
    currentExpenseAggregate._sum.amount,
  );
  const currentIncomeTotal = decimalToNumber(
    currentIncomeAggregate._sum.amount,
  );
  const balance = currentIncomeTotal - currentExpensesTotal;

  const monthlyBudget =
    budgets.find((budget) => budget.categoryId === null) ?? null;

  const totalBudget = monthlyBudget
    ? decimalToNumber(monthlyBudget.amount)
    : budgets.reduce(
        (total, budget) => total + decimalToNumber(budget.amount),
        0,
      );

  const budgetUsage =
    totalBudget > 0
      ? Math.min((currentExpensesTotal / totalBudget) * 100, 100)
      : 0;

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

  const goalSaved = activeGoal
    ? activeGoal.contributions.reduce(
        (total, contribution) => total + decimalToNumber(contribution.amount),
        0,
      )
    : 0;

  const goalTarget = activeGoal ? decimalToNumber(activeGoal.targetAmount) : 0;

  const goalProgress =
    goalTarget > 0 ? Math.min((goalSaved / goalTarget) * 100, 100) : 0;

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
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              <ReceiptText className="h-4 w-4" />
              View expenses
            </Link>
            <Link
              href="/dashboard/expenses/new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
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
            detail={`${currentExpenses.length} recorded expenses`}
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
                ? `${formatCurrency(currentExpensesTotal, currency)} of ${formatCurrency(totalBudget, currency)}`
                : "Create your first budget"
            }
            icon={<PiggyBank className="h-5 w-5" />}
            tone={budgetUsage > 90 ? "red" : "purple"}
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
                  Your active monthly budget.
                </p>
              </div>
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>

            {totalBudget > 0 ? (
              <div className="mt-7">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-3xl font-semibold">
                    {percentage(budgetUsage)}
                  </span>
                  <span className="text-right text-xs text-muted-foreground">
                    {formatCurrency(totalBudget, currency)}
                    <br />
                    planned
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className={`h-full rounded-full ${
                      budgetUsage > 90
                        ? "bg-destructive"
                        : budgetUsage > 70
                          ? "bg-warning"
                          : "bg-success"
                    }`}
                    style={{ width: `${Math.max(budgetUsage, 2)}%` }}
                  />
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  {budgetUsage > 90
                    ? "You are close to your budget limit."
                    : budgetUsage > 70
                      ? "Keep an eye on your spending."
                      : "Your spending is within a comfortable range."}
                </p>
              </div>
            ) : (
              <EmptyState
                title="No budget set"
                description="Set a monthly budget to track your progress."
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
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
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
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          transaction.type === "income"
                            ? "bg-success/15 text-success"
                            : "bg-primary/15 text-primary"
                        }`}
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
                          {format(transaction.date, "d MMM yyyy")}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        transaction.type === "income"
                          ? "text-success"
                          : "text-foreground"
                      }`}
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

              {activeGoal ? (
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">
                      {activeGoal.name}
                    </p>
                    <span className="text-sm font-semibold">
                      {percentage(goalProgress)}
                    </span>
                  </div>

                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-primary to-accent"
                      style={{ width: `${Math.max(goalProgress, 2)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between gap-3 text-xs text-muted-foreground">
                    <span>{formatCurrency(goalSaved, currency)} saved</span>
                    <span>{formatCurrency(goalTarget, currency)}</span>
                  </div>

                  {activeGoal.targetDate ? (
                    <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Target {format(activeGoal.targetDate, "d MMM yyyy")}
                    </p>
                  ) : null}
                </div>
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
                          {format(recurring.nextDueDate, "d MMM")}
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

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="flex justify-end"
        >
          <button
            type="submit"
            className="text-xs text-muted-foreground transition hover:text-foreground"
          >
            Sign out
          </button>
        </form>
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
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
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
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        {linkLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
