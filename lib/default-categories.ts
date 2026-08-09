import { prisma } from "@/lib/prisma";

export const DEFAULT_CATEGORY_DEFINITIONS = [
  {
    name: "Food & Dining",
    icon: "Utensils",
    color: "#F97316",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Transport",
    icon: "Car",
    color: "#3B82F6",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Shopping",
    icon: "ShoppingBag",
    color: "#EC4899",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Bills & Utilities",
    icon: "Receipt",
    color: "#EAB308",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Entertainment",
    icon: "Clapperboard",
    color: "#A855F7",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Health",
    icon: "HeartPulse",
    color: "#EF4444",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Education",
    icon: "GraduationCap",
    color: "#14B8A6",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Travel",
    icon: "Plane",
    color: "#06B6D4",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Rent",
    icon: "House",
    color: "#6366F1",
    type: "EXPENSE",
    isDefault: true,
  },
  {
    name: "Other",
    icon: "Tag",
    color: "#64748B",
    type: "BOTH",
    isDefault: true,
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
      type: category.type,
      isDefault: category.isDefault,
    })),
    skipDuplicates: true,
  });
}
