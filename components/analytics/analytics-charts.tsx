"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";
import type {
  BudgetAnalyticsItem,
  CategoryAnalyticsItem,
  IncomeSourceAnalyticsItem,
  MonthlyAnalyticsItem,
} from "@/components/analytics/analytics-dashboard";

type AnalyticsChartsProps = {
  monthlyData: MonthlyAnalyticsItem[];
  categoryData: CategoryAnalyticsItem[];
  sourceData: IncomeSourceAnalyticsItem[];
  budgetData: BudgetAnalyticsItem[];
  currency: string;
};

const chartColors = [
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#22C55E",
  "#EC4899",
  "#EAB308",
  "#EF4444",
  "#3B82F6",
];

function compactCurrency(value: number, currency: string) {
  const symbol =
    currency === "USD"
      ? "$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : "₹";

  if (Math.abs(value) >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}K`;
  }

  return `${symbol}${value.toFixed(0)}`;
}

function tooltipValue(value: unknown, currency: string) {
  return formatCurrency(Number(value), currency);
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/60">
      <div className="px-6 text-center">
        <p className="text-sm font-medium">No chart data yet</p>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "rgba(17, 25, 54, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  borderRadius: "12px",
  color: "#ffffff",
};

export function AnalyticsCharts({
  monthlyData,
  categoryData,
  sourceData,
  budgetData,
  currency,
}: AnalyticsChartsProps) {
  const hasMonthlyData = monthlyData.some(
    (item) => item.income > 0 || item.expenses > 0,
  );

  const hasCategoryData = categoryData.length > 0;
  const hasSourceData = sourceData.length > 0;
  const hasBudgetData = budgetData.length > 0;

  return (
    <div className="space-y-6">
      <section className="glass-panel-strong rounded-3xl p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold">Monthly cash flow</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Income, expenses, and net cash flow across the selected period.
          </p>
        </div>

        <div className="h-80 w-full">
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{
                  top: 8,
                  right: 8,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="analyticsIncomeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="analyticsExpenseGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", fontSize: 11 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", fontSize: 11 }}
                  tickFormatter={(value) =>
                    compactCurrency(Number(value), currency)
                  }
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    tooltipValue(value, currency),
                    name,
                  ]}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "12px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  fill="url(#analyticsIncomeGradient)"
                />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fill="url(#analyticsExpenseGradient)"
                />

                <Area
                  type="monotone"
                  dataKey="net"
                  name="Net cash flow"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Add income or expenses to see cash flow." />
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel-strong rounded-3xl p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold">Spending by category</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Expense distribution across your categories.
            </p>
          </div>

          <div className="h-80 w-full">
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [
                      tooltipValue(value, currency),
                      "Expenses",
                    ]}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                    }}
                  />

                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {categoryData.map((category, index) => (
                      <Cell
                        key={`${category.name}-${index}`}
                        fill={
                          category.color ||
                          chartColors[index % chartColors.length]
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Add an expense to see category distribution." />
            )}
          </div>
        </div>

        <div className="glass-panel-strong rounded-3xl p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold">Income by source</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Where your recorded income came from.
            </p>
          </div>

          <div className="h-80 w-full">
            {hasSourceData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sourceData}
                  layout="vertical"
                  margin={{
                    top: 8,
                    right: 8,
                    left: 20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    stroke="currentColor"
                    strokeOpacity={0.08}
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 11 }}
                    tickFormatter={(value) =>
                      compactCurrency(Number(value), currency)
                    }
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [
                      tooltipValue(value, currency),
                      "Income",
                    ]}
                  />

                  <Bar
                    dataKey="amount"
                    name="Income"
                    fill="#22C55E"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Add income to see your income sources." />
            )}
          </div>
        </div>
      </section>

      <section className="glass-panel-strong rounded-3xl p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold">Budget versus actual</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Compare budget limits with expenses recorded inside each budget
            period.
          </p>
        </div>

        <div className="h-96 w-full">
          {hasBudgetData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetData}
                layout="vertical"
                margin={{
                  top: 8,
                  right: 8,
                  left: 20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", fontSize: 11 }}
                  tickFormatter={(value) =>
                    compactCurrency(Number(value), currency)
                  }
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    tooltipValue(value, currency),
                    name,
                  ]}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "12px",
                  }}
                />

                <Bar
                  dataKey="amount"
                  name="Budget"
                  fill="#06B6D4"
                  radius={[0, 5, 5, 0]}
                />

                <Bar
                  dataKey="spent"
                  name="Actual spending"
                  fill="#8B5CF6"
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Create a budget to compare planned and actual spending." />
          )}
        </div>
      </section>
    </div>
  );
}
