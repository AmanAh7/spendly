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

  return `${symbol}${value}`;
}

function tooltipFormatter(value: number, currency: string) {
  return [
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value),
    "",
  ];
}

export function DashboardCharts({
  monthlyData,
  currency,
}: DashboardChartsProps) {
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
          {monthlyData.length > 0 ? (
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
                  tickFormatter={(value) => compactCurrency(value, currency)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 25, 54, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: "12px",
                    color: "#ffffff",
                  }}
                  formatter={(value) =>
                    tooltipFormatter(Number(value), currency)
                  }
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
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No expense data available yet.
            </div>
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
          {monthlyData.length > 0 ? (
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
                  tickFormatter={(value) => compactCurrency(value, currency)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 25, 54, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: "12px",
                    color: "#ffffff",
                  }}
                  formatter={(value) =>
                    tooltipFormatter(Number(value), currency)
                  }
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
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No income or expense data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
