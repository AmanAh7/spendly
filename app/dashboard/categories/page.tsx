import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureDefaultCategories } from "@/lib/default-categories";
import { CategoryManager } from "@/components/categories/category-manager";

export default async function CategoriesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  await ensureDefaultCategories(userId);

  const categories = await prisma.category.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      isDefault: true,
      appliesToExpenses: true,
      appliesToBudgets: true,
      appliesToRecurringExpenses: true,
      appliesToGoals: true,
      _count: {
        select: {
          expenses: true,
          budgets: true,
          goals: true,
          recurringExpenses: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <CategoryManager
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            isDefault: category.isDefault,
            referenceCount:
              category._count.expenses +
              category._count.budgets +
              category._count.goals +
              category._count.recurringExpenses,
            appliesToExpenses: category.appliesToExpenses,
            appliesToBudgets: category.appliesToBudgets,
            appliesToRecurringExpenses: category.appliesToRecurringExpenses,
            appliesToGoals: category.appliesToGoals,
          }))}
        />
      </div>
    </main>
  );
}
