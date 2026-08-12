import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureDefaultIncomeSources } from "@/lib/default-income-sources";
import { IncomeSourceManager } from "@/components/income-sources/income-source-manager";

export default async function IncomeSourcesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  await ensureDefaultIncomeSources(userId);

  const sources = await prisma.incomeSource.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      isDefault: true,
      _count: { select: { incomes: true } },
    },
  });

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <IncomeSourceManager
          sources={sources.map((source) => ({
            id: source.id,
            name: source.name,
            isDefault: source.isDefault,
            referenceCount: source._count.incomes,
          }))}
        />
      </div>
    </main>
  );
}
