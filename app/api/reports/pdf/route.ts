import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getReportData } from "@/lib/report-data";

function escapePdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function buildPdf(lines: string[]) {
  const linesPerPage = 42;
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  if (pages.length === 0) {
    pages.push(["Spendly financial report"]);
  }

  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];
  const contentObjectNumbers: number[] = [];

  const catalogObjectNumber = 1;
  const pagesObjectNumber = 2;
  const fontObjectNumber = 3;

  objects[catalogObjectNumber] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[pagesObjectNumber] = "";
  objects[fontObjectNumber] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let nextObjectNumber = 4;

  for (const pageLines of pages) {
    const contentObjectNumber = nextObjectNumber++;
    const pageObjectNumber = nextObjectNumber++;

    const commands = [
      "BT",
      "/F1 11 Tf",
      "50 770 Td",
      ...pageLines.flatMap((line, index) => [
        index === 0 ? `(${escapePdfText(line)}) Tj` : "0 -17 Td",
        index === 0 ? "" : `(${escapePdfText(line)}) Tj`,
      ]),
      "ET",
    ]
      .filter(Boolean)
      .join("\n");

    const stream = `${commands}\n`;

    objects[contentObjectNumber] =
      `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;

    objects[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;

    contentObjectNumbers.push(contentObjectNumber);
    pageObjectNumbers.push(pageObjectNumber);
  }

  objects[pagesObjectNumber] = `<< /Type /Pages /Kids [${pageObjectNumbers
    .map((number) => `${number} 0 R`)
    .join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let number = 1; number < objects.length; number += 1) {
    offsets[number] = pdf.length;
    pdf += `${number} 0 obj\n${objects[number]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;

  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let number = 1; number < objects.length; number += 1) {
    pdf += `${String(offsets[number]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogObjectNumber} 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
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
  const report = await getReportData(
    session.user.id,
    url.searchParams.get("range") ?? undefined,
  );

  const lines: string[] = [
    "SPENDLY FINANCIAL REPORT",
    `Period: ${report.periodLabel}`,
    "",
    `Total income: ${formatNumber(report.totalIncome)}`,
    `Total expenses: ${formatNumber(report.totalExpenses)}`,
    `Net cash flow: ${formatNumber(report.netCashFlow)}`,
    `Savings rate: ${report.savingsRate.toFixed(2)}%`,
    "",
    "MONTHLY SUMMARY",
    "Month | Income | Expenses | Net cash flow",
    ...report.monthlyData.map(
      (item) =>
        `${item.month} | ${formatNumber(item.income)} | ${formatNumber(
          item.expenses,
        )} | ${formatNumber(item.net)}`,
    ),
    "",
    "SPENDING BY CATEGORY",
    ...report.categoryData.map(
      (item) => `${item.name}: ${formatNumber(item.amount)}`,
    ),
    "",
    "INCOME BY SOURCE",
    ...report.sourceData.map(
      (item) => `${item.name}: ${formatNumber(item.amount)}`,
    ),
    "",
    "BUDGET VERSUS ACTUAL",
    ...report.budgetData.map(
      (item) =>
        `${item.name} (${item.categoryName}): budget ${formatNumber(
          item.amount,
        )}, spent ${formatNumber(item.spent)}, usage ${item.usage.toFixed(2)}%`,
    ),
    "",
    "GOALS",
    ...report.goalData.map(
      (item) =>
        `${item.name}: saved ${formatNumber(item.saved)} of ${formatNumber(
          item.targetAmount,
        )}, progress ${item.progress.toFixed(2)}%`,
    ),
  ];

  const pdf = buildPdf(lines);

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="spendly-report-${report.range}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
