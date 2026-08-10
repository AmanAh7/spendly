"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema, type BudgetInput } from "@/lib/validators/budget";

export type BudgetActionResult = {
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

function toUtcDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

async function validateCategoryOwnership(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      type: {
        in: ["EXPENSE", "BOTH"],
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(category);
}

function getValidationMessage(
  result: ReturnType<typeof budgetSchema.safeParse>,
) {
  if (result.success) {
    return undefined;
  }

  return result.error.issues[0]?.message ?? "Please check the budget details.";
}

export async function createBudget(
  input: BudgetInput,
): Promise<BudgetActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    const parsed = budgetSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: getValidationMessage(parsed),
      };
    }

    const categoryId = parsed.data.categoryId || null;

    if (categoryId && !(await validateCategoryOwnership(userId, categoryId))) {
      return {
        error: "The selected category is invalid.",
      };
    }

    await prisma.budget.create({
      data: {
        userId,
        categoryId,
        name: parsed.data.name,
        amount: new Prisma.Decimal(parsed.data.amount),
        periodStart: toUtcDate(parsed.data.periodStart),
        periodEnd: toUtcDate(parsed.data.periodEnd),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/budgets");

    return {
      success: "Budget created successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "A budget with this name already exists for that start date.",
      };
    }

    console.error("Create budget error:", error);

    return {
      error: "Unable to create the budget. Please try again.",
    };
  }
}

export async function updateBudget(
  id: string,
  input: BudgetInput,
): Promise<BudgetActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return {
        error: "Budget not found.",
      };
    }

    const parsed = budgetSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: getValidationMessage(parsed),
      };
    }

    const categoryId = parsed.data.categoryId || null;

    if (categoryId && !(await validateCategoryOwnership(userId, categoryId))) {
      return {
        error: "The selected category is invalid.",
      };
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingBudget) {
      return {
        error: "Budget not found.",
      };
    }

    await prisma.budget.update({
      where: {
        id: existingBudget.id,
      },
      data: {
        categoryId,
        name: parsed.data.name,
        amount: new Prisma.Decimal(parsed.data.amount),
        periodStart: toUtcDate(parsed.data.periodStart),
        periodEnd: toUtcDate(parsed.data.periodEnd),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/budgets");

    return {
      success: "Budget updated successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "A budget with this name already exists for that start date.",
      };
    }

    console.error("Update budget error:", error);

    return {
      error: "Unable to update the budget. Please try again.",
    };
  }
}

export async function deleteBudget(id: string): Promise<BudgetActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return {
        error: "Budget not found.",
      };
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingBudget) {
      return {
        error: "Budget not found.",
      };
    }

    await prisma.budget.delete({
      where: {
        id: existingBudget.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/budgets");

    return {
      success: "Budget deleted successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Delete budget error:", error);

    return {
      error: "Unable to delete the budget. Please try again.",
    };
  }
}
