import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_NAMES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Rent",
  "Other",
];

async function main() {
  const result = await prisma.category.updateMany({
    where: {
      name: {
        in: DEFAULT_NAMES,
      },
      isDefault: true,
    },
    data: {
      appliesToExpenses: true,
      appliesToBudgets: true,
      appliesToRecurringExpenses: true,
      appliesToGoals: true,
    },
  });

  console.log(
    `Updated ${result.count} default categories to be applicable to all 4 features.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
