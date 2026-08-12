import { prisma } from "@/lib/prisma";

export const defaultIncomeSourceNames = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Interest",
  "Rental Income",
  "Gift",
  "Other",
] as const;

export async function ensureDefaultIncomeSources(userId: string) {
  await prisma.incomeSource.createMany({
    data: defaultIncomeSourceNames.map((name) => ({
      userId,
      name,
      isDefault: true,
    })),
    skipDuplicates: true,
  });
}
