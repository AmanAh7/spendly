import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getReportData } from "@/lib/report-data";

type CsvType =
  | "transactions"
  | "expenses"
  | "income"
  | "analytics"
  | "goals"
  | "budgets";

function getCsvType(value: string | null): CsvType {
  if (
    value === "transactions" ||
    value === "expenses" ||
    value === "income" ||
    value === "analytics" ||
    value === "goals" ||
    value === "budgets"
  ) {
    return value;
  }

  return "transactions";
}

function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
}

function row(values: Array<string | number | null | undefined>) {
  return values.map(escapeCsv).join(",");
}

function buildCsv(
  type: CsvType,
  report: Awaited<ReturnType<typeof getReportData>>,
) {
  if (type === "expenses") {
    return [
      row([
        "Date",
        "Description",
        "Category",
        "Payment method",
        "Amount",
        "Notes",
      ]),
      ...report.transactions
        .filter((transaction) => transaction.type === "expense")
        .map((transaction) =>
          row([
            transaction.date,
            transaction.description,
            transaction.classification,
            transaction.paymentMethod,
            transaction.amount,
            transaction.notes,
          ]),
        ),
    ].join("\r\n");
  }

  if (type === "income") {
    return [
      row(["Date", "Description", "Source", "Amount", "Notes"]),
      ...report.transactions
        .filter((transaction) => transaction.type === "income")
        .map((transaction) =>
          row([
            transaction.date,
            transaction.description,
            transaction.classification,
            transaction.amount,
            transaction.notes,
          ]),
        ),
    ].join("\r\n");
  }

  if (type === "analytics") {
    return [
      row(["Metric", "Value"]),
      row(["Period", report.periodLabel]),
      row(["Total income", report.totalIncome]),
      row(["Total expenses", report.totalExpenses]),
      row(["Net cash flow", report.netCashFlow]),
      row(["Savings rate", `${report.savingsRate.toFixed(2)}%`]),
      "",
      row(["Monthly summary"]),
      row(["Month", "Income", "Expenses", "Net cash flow"]),
      ...report.monthlyData.map((item) =>
        row([item.month, item.income, item.expenses, item.net]),
      ),
      "",
      row(["Spending by category"]),
      row(["Category", "Amount"]),
      ...report.categoryData.map((item) => row([item.name, item.amount])),
      "",
      row(["Income by source"]),
      row(["Source", "Amount"]),
      ...report.sourceData.map((item) => row([item.name, item.amount])),
    ].join("\r\n");
  }

  if (type === "budgets") {
    return [
      row([
        "Budget",
        "Category",
        "Budget amount",
        "Actual spending",
        "Remaining",
        "Usage",
      ]),
      ...report.budgetData.map((item) =>
        row([
          item.name,
          item.categoryName,
          item.amount,
          item.spent,
          item.remaining,
          `${item.usage.toFixed(2)}%`,
        ]),
      ),
    ].join("\r\n");
  }

  if (type === "goals") {
    return [
      row([
        "Goal",
        "Target amount",
        "Saved",
        "Remaining",
        "Progress",
        "Target date",
        "Completed",
      ]),
      ...report.goalData.map((item) =>
        row([
          item.name,
          item.targetAmount,
          item.saved,
          item.remaining,
          `${item.progress.toFixed(2)}%`,
          item.targetDate,
          item.completed ? "Yes" : "No",
        ]),
      ),
    ].join("\r\n");
  }

  return [
    row([
      "Date",
      "Type",
      "Description",
      "Classification",
      "Payment method",
      "Amount",
      "Notes",
    ]),
    ...report.transactions.map((transaction) =>
      row([
        transaction.date,
        transaction.type,
        transaction.description,
        transaction.classification,
        transaction.paymentMethod,
        transaction.amount,
        transaction.notes,
      ]),
    ),
  ].join("\r\n");
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      },
    );
  }

  const url = new URL(request.url);
  const type = getCsvType(url.searchParams.get("type"));
  const report = await getReportData(
    session.user.id,
    url.searchParams.get("range") ?? undefined,
  );
  const csv = `\uFEFF${buildCsv(type, report)}`;
  const filename = `spendly-${type}-${report.range}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
