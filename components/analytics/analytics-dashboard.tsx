"use client";

import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  WalletCards,
} from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";

export type AnalyticsRange = "current" | "3" | "6" | "12";

export type MonthlyAnalyticsItem = {
  month: string;
  income: number;
  expenses: number;
  net: number;
};

export type CategoryAnalyticsItem = {
  name: string;
  color: string;
  amount: number;
};

export type IncomeSourceAnalyticsItem = {
  name: string;
  amount: number;
};

export type BudgetAnalyticsItem = {
  name: string;
  categoryName: string;
  amount: number;
  spent: number;
  remaining: number;
  usage: number;
};

export type AnalyticsData = {
  range: AnalyticsRange;
  periodLabel: string;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  monthlyData: MonthlyAnalyticsItem[];
  categoryData: CategoryAnalyticsItem[];
  sourceData: IncomeSourceAnalyticsItem[];
  budgetData: BudgetAnalyticsItem[];
  categoryId?: string;
  categories?: { id: string; name: string }[];
};

type AnalyticsDashboardProps = {
  data: AnalyticsData;
  currency: string;
};

const rangeOptions: Array<{
  value: AnalyticsRange;
  label: string;
}> = [
  {
    value: "current",
    label: "Current month",
  },
  {
    value: "3",
    label: "Last 3 months",
  },
  {
    value: "6",
    label: "Last 6 months",
  },
  {
    value: "12",
    label: "Last 12 months",
  },
];

export function AnalyticsDashboard({
  data,
  currency,
}: AnalyticsDashboardProps) {
  const router = useRouter();

  function changeRange(range: AnalyticsRange) {
    const params = new URLSearchParams();
    params.set("range", range);
    if (data.categoryId) {
      params.set("categoryId", data.categoryId);
    }
    router.push(`/dashboard/analytics?${params.toString()}`);
  }

  function changeCategory(nextCategoryId: string) {
    const params = new URLSearchParams();
    params.set("range", data.range);
    if (nextCategoryId) {
      params.set("categoryId", nextCategoryId);
    }
    router.push(`/dashboard/analytics?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Finance</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Understand your financial activity for {data.periodLabel}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">
              Time range
            </span>
            <select
              value={data.range}
              onChange={(event) =>
                changeRange(event.target.value as AnalyticsRange)
              }
              className="h-11 min-w-48 rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {data.categories && data.categories.length > 0 ? (
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">
                Category
              </span>
              <select
                value={data.categoryId ?? ""}
                onChange={(event) => changeCategory(event.target.value)}
                className="h-11 min-w-48 rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All categories</option>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total income"
          value={formatCurrency(data.totalIncome, currency)}
          detail="Recorded income"
          icon={<ArrowUpRight className="h-5 w-5" />}
          tone="green"
        />

        <MetricCard
          title="Total expenses"
          value={formatCurrency(data.totalExpenses, currency)}
          detail="Recorded expenses"
          icon={<ArrowDownRight className="h-5 w-5" />}
          tone="violet"
        />

        <MetricCard
          title="Net cash flow"
          value={formatCurrency(data.netCashFlow, currency)}
          detail={
            data.netCashFlow >= 0
              ? "Income remaining after expenses"
              : "Expenses exceeded income"
          }
          icon={<WalletCards className="h-5 w-5" />}
          tone={data.netCashFlow >= 0 ? "blue" : "red"}
        />

        <MetricCard
          title="Savings rate"
          value={`${data.savingsRate.toFixed(1)}%`}
          detail="Net cash flow as a share of income"
          icon={<BarChart3 className="h-5 w-5" />}
          tone={
            data.savingsRate >= 20
              ? "green"
              : data.savingsRate >= 0
                ? "blue"
                : "red"
          }
        />
      </section>

      <AnalyticsCharts
        monthlyData={data.monthlyData}
        categoryData={data.categoryData}
        sourceData={data.sourceData}
        budgetData={data.budgetData}
        currency={currency}
      />
    </div>
  );
}

function MetricCard({
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
  tone: "green" | "violet" | "blue" | "red";
}) {
  const toneClasses = {
    green: "bg-success/15 text-success",
    violet: "bg-primary/15 text-primary",
    blue: "bg-accent/15 text-accent",
    red: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="glass-panel-strong rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-3 truncate text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 truncate text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
