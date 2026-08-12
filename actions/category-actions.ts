"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema, type CategoryInput } from "@/lib/validators/category";

export type CategoryActionResult = {
  error?: string;
  success?: string;
};

async function getAuthenticatedUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

function getValidationError(input: CategoryInput) {
  const parsed = categorySchema.safeParse(input);

  if (parsed.success) {
    return null;
  }

  return (
    parsed.error.issues[0]?.message ?? "Please check the category details."
  );
}

function getActionError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return "Your session has expired. Please sign in again.";
  }

  console.error(fallback, error);
  return fallback;
}

function hasExpenseCompatibleReferences(referenceCounts: {
  expenses: number;
  budgets: number;
  recurringExpenses: number;
}) {
  return (
    referenceCounts.expenses > 0 ||
    referenceCounts.budgets > 0 ||
    referenceCounts.recurringExpenses > 0
  );
}

function validateTypeChange(
  nextType: CategoryInput["type"],
  counts: {
    expenses: number;
    budgets: number;
    goals: number;
    recurringExpenses: number;
  },
) {
  if (
    nextType === "INCOME" &&
    hasExpenseCompatibleReferences({
      expenses: counts.expenses,
      budgets: counts.budgets,
      recurringExpenses: counts.recurringExpenses,
    })
  ) {
    return "This category is used by expense-related records and cannot be changed to income-only.";
  }

  return null;
}

function revalidateCategoryPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard/recurring");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard/transactions");
}

export async function createCategory(
  input: CategoryInput,
): Promise<CategoryActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    const validationError = getValidationError(input);

    if (validationError) {
      return { error: validationError };
    }

    const parsed = categorySchema.parse(input);

    await prisma.category.create({
      data: {
        userId,
        name: parsed.name,
        icon: parsed.icon,
        color: parsed.color,
        type: parsed.type,
        isDefault: false,
      },
    });

    revalidateCategoryPaths();

    return {
      success: "Category created successfully.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "A category with this name already exists.",
      };
    }

    return {
      error: getActionError(
        error,
        "Unable to create the category. Please try again.",
      ),
    };
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<CategoryActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return {
        error: "Category not found.",
      };
    }

    const validationError = getValidationError(input);

    if (validationError) {
      return { error: validationError };
    }

    const parsed = categorySchema.parse(input);

    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        name: true,
        isDefault: true,
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

    if (!existingCategory) {
      return {
        error: "Category not found.",
      };
    }

    if (existingCategory.isDefault && parsed.name !== existingCategory.name) {
      return {
        error: "Default category names cannot be changed.",
      };
    }

    const typeError = validateTypeChange(parsed.type, {
      expenses: existingCategory._count.expenses,
      budgets: existingCategory._count.budgets,
      goals: existingCategory._count.goals,
      recurringExpenses: existingCategory._count.recurringExpenses,
    });

    if (typeError) {
      return {
        error: typeError,
      };
    }

    await prisma.category.update({
      where: {
        id: existingCategory.id,
      },
      data: {
        name: parsed.name,
        icon: parsed.icon,
        color: parsed.color,
        type: parsed.type,
      },
    });

    revalidateCategoryPaths();

    return {
      success: "Category updated successfully.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "A category with this name already exists.",
      };
    }

    return {
      error: getActionError(
        error,
        "Unable to update the category. Please try again.",
      ),
    };
  }
}

export async function deleteCategory(
  id: string,
): Promise<CategoryActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return {
        error: "Category not found.",
      };
    }

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        name: true,
        isDefault: true,
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

    if (!category) {
      return {
        error: "Category not found.",
      };
    }

    if (category.isDefault) {
      return {
        error: "Default categories cannot be deleted.",
      };
    }

    const referenceCount =
      category._count.expenses +
      category._count.budgets +
      category._count.goals +
      category._count.recurringExpenses;

    if (referenceCount > 0) {
      return {
        error:
          "This category is still used by existing financial records and cannot be deleted.",
      };
    }

    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });

    revalidateCategoryPaths();

    return {
      success: "Category deleted successfully.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error:
          "This category is still referenced by financial records and cannot be deleted.",
      };
    }

    return {
      error: getActionError(
        error,
        "Unable to delete the category. Please try again.",
      ),
    };
  }
}
