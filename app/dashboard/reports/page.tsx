import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getReportData } from "@/lib/report-data";
import { ReportDashboard } from "@/components/reports/report-dashboard";

type ReportsPageProps = {
  searchParams: Promise<{
    range?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const userId = session.user.id;

  const [user, report] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        currency: true,
      },
    }),
    getReportData(userId, params.range),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ReportDashboard report={report} currency={user.currency} />
      </div>
    </main>
  );
}
