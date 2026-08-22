"use client";

import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  WalletCards,
} from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { ReportData, ReportRange } from "@/lib/report-data";
import { PageHeader } from "@/components/layout/page-header";

type ReportDashboardProps = {
  report: ReportData;
  currency: string;
};

const rangeOptions: Array<{
  value: ReportRange;
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

const csvOptions = [
  {
    type: "transactions",
    label: "Transactions",
  },
  {
    type: "expenses",
    label: "Expenses",
  },
  {
    type: "income",
    label: "Income",
  },
  {
    type: "analytics",
    label: "Analytics summary",
  },
  {
    type: "budgets",
    label: "Budgets",
  },
  {
    type: "goals",
    label: "Goals",
  },
];

export function ReportDashboard({ report, currency }: ReportDashboardProps) {
  const router = useRouter();

  function changeRange(range: ReportRange) {
    router.push(`/dashboard/reports?range=${range}`);
  }

  const csvUrl = (type: string) =>
    `/api/reports/csv?type=${type}&range=${report.range}`;

  const pdfUrl = `/api/reports/pdf?range=${report.range}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Reports"
        description={`Download your financial activity for ${report.periodLabel}.`}
        actions={
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">
              Time range
            </span>

            <select
              value={report.range}
              onChange={(event) =>
                changeRange(event.target.value as ReportRange)
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
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total income"
          value={formatCurrency(report.totalIncome, currency)}
          detail="Recorded income"
          icon={<ArrowUpRight className="h-5 w-5" />}
          tone="green"
        />

        <MetricCard
          title="Total expenses"
          value={formatCurrency(report.totalExpenses, currency)}
          detail="Recorded expenses"
          icon={<ArrowDownRight className="h-5 w-5" />}
          tone="violet"
        />

        <MetricCard
          title="Net cash flow"
          value={formatCurrency(report.netCashFlow, currency)}
          detail={
            report.netCashFlow >= 0
              ? "Income remaining after expenses"
              : "Expenses exceeded income"
          }
          icon={<WalletCards className="h-5 w-5" />}
          tone={report.netCashFlow >= 0 ? "blue" : "red"}
        />

        <MetricCard
          title="Savings rate"
          value={`${report.savingsRate.toFixed(1)}%`}
          detail="Net cash flow as a share of income"
          icon={<BarChart3 className="h-5 w-5" />}
          tone={
            report.savingsRate >= 20
              ? "green"
              : report.savingsRate >= 0
                ? "blue"
                : "red"
          }
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel-strong rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-semibold">CSV exports</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Download structured data for the selected period.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {csvOptions.map((option) => (
              <a
                key={option.type}
                href={csvUrl(option.type)}
                download
                className="inline-flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                {option.label}
                <Download className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="glass-panel-strong rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-semibold">PDF report</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Download a summary report for the selected period.
              </p>
            </div>
          </div>

          <a
            href={pdfUrl}
            download
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Download PDF report
          </a>
        </div>
      </section>

      <section className="glass-panel-strong overflow-hidden rounded-3xl">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="text-base font-semibold">Monthly summary</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Income, expenses, and net cash flow for each month.
          </p>
        </div>

        {report.monthlyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left">
              <thead className="border-b border-border/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-medium">Month</th>
                  <th className="px-5 py-4 text-right font-medium">Income</th>
                  <th className="px-5 py-4 text-right font-medium">Expenses</th>
                  <th className="px-5 py-4 text-right font-medium">
                    Net cash flow
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/40">
                {report.monthlyData.map((item) => (
                  <tr key={item.month}>
                    <td className="px-5 py-4 text-sm font-medium">
                      {item.month}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-success">
                      {formatCurrency(item.income, currency)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm">
                      {formatCurrency(item.expenses, currency)}
                    </td>

                    <td
                      className={`px-5 py-4 text-right text-sm font-semibold ${
                        item.net >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {formatCurrency(item.net, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium">No report data available</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Add income or expenses to generate a report.
            </p>
          </div>
        )}
      </section>
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
