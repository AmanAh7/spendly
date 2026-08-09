"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthlyChartItem = {
  month: string;
  income: number;
  expenses: number;
};

type DashboardChartsProps = {
  monthlyData: MonthlyChartItem[];
  currency: string;
};

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

function formatTooltipValue(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
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

export function DashboardCharts({
  monthlyData,
  currency,
}: DashboardChartsProps) {
  const hasExpenseData = monthlyData.some((item) => item.expenses > 0);

  const hasCashflowData = monthlyData.some(
    (item) => item.income > 0 || item.expenses > 0,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="glass-panel-strong rounded-3xl p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold">Expense trend</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your actual expenses over the last six months.
          </p>
        </div>

        <div className="h-72 w-full">
          {hasExpenseData ? (
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
                    id="expenseGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                  domain={[0, "dataMax"]}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 25, 54, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: "12px",
                    color: "#ffffff",
                  }}
                  formatter={(value) => [
                    formatTooltipValue(Number(value), currency),
                    "Expenses",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Add an expense to see your spending trend." />
          )}
        </div>
      </div>

      <div className="glass-panel-strong rounded-3xl p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold">Income vs expenses</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Compare your actual monthly cash flow.
          </p>
        </div>

        <div className="h-72 w-full">
          {hasCashflowData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 8,
                  right: 8,
                  left: -20,
                  bottom: 0,
                }}
              >
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
                  domain={[0, "dataMax"]}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 25, 54, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: "12px",
                    color: "#ffffff",
                  }}
                  formatter={(value, name) => [
                    formatTooltipValue(Number(value), currency),
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
                  dataKey="income"
                  name="Income"
                  fill="#22c55e"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Add income or expenses to compare cash flow." />
          )}
        </div>
      </div>
    </div>
  );
}
