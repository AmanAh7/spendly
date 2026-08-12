import { prisma } from "@/lib/prisma";

export const DEFAULT_CATEGORY_DEFINITIONS = [
  {
    name: "Food & Dining",
    icon: "Utensils",
    color: "#F97316",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
  {
    name: "Transport",
    icon: "Car",
    color: "#3B82F6",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
  {
    name: "Shopping",
    icon: "ShoppingBag",
    color: "#EC4899",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
  {
    name: "Bills & Utilities",
    icon: "Receipt",
    color: "#EAB308",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
  {
    name: "Entertainment",
    icon: "Clapperboard",
    color: "#A855F7",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
  {
    name: "Health",
    icon: "HeartPulse",
    color: "#EF4444",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
  {
    name: "Education",
    icon: "GraduationCap",
    color: "#14B8A6",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
  {
    name: "Travel",
    icon: "Plane",
    color: "#06B6D4",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
  {
    name: "Rent",
    icon: "House",
    color: "#6366F1",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
  {
    name: "Other",
    icon: "Tag",
    color: "#64748B",
    isDefault: true,
    appliesToExpenses: true,
    appliesToBudgets: true,
    appliesToRecurringExpenses: true,
    appliesToGoals: true,
  },
] as const;

export async function ensureDefaultCategories(userId: string) {
  const existingCategories = await prisma.category.findMany({
    where: {
      userId,
    },
    select: {
      name: true,
    },
  });

  const existingNames = new Set(
    existingCategories.map((category) => category.name),
  );

  const missingCategories = DEFAULT_CATEGORY_DEFINITIONS.filter(
    (category) => !existingNames.has(category.name),
  );

  if (missingCategories.length === 0) {
    return;
  }

  await prisma.category.createMany({
    data: missingCategories.map((category) => ({
      userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      isDefault: category.isDefault,
      appliesToExpenses: category.appliesToExpenses,
      appliesToBudgets: category.appliesToBudgets,
      appliesToRecurringExpenses: category.appliesToRecurringExpenses,
      appliesToGoals: category.appliesToGoals,
    })),
    skipDuplicates: true,
  });
}
