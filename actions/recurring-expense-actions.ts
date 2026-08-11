"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  recurringExpenseSchema,
  type RecurringExpenseInput,
} from "@/lib/validators/recurring-expense";

export type RecurringExpenseActionResult = {
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

function toUtcDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
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

function actionError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return "Your session has expired. Please sign in again.";
  }

  console.error(fallback, error);
  return fallback;
}

export async function createRecurringExpense(
  input: RecurringExpenseInput,
): Promise<RecurringExpenseActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    const parsed = recurringExpenseSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ??
          "Please check the recurring expense details.",
      };
    }

    if (!(await validateCategoryOwnership(userId, parsed.data.categoryId))) {
      return {
        error: "The selected category is invalid.",
      };
    }

    await prisma.recurringExpense.create({
      data: {
        userId,
        categoryId: parsed.data.categoryId,
        amount: new Prisma.Decimal(parsed.data.amount),
        description: parsed.data.description,
        paymentMethod: parsed.data.paymentMethod,
        frequency: parsed.data.frequency,
        generationMode: parsed.data.generationMode,
        nextDueDate: toUtcDate(parsed.data.nextDueDate),
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/recurring");

    return {
      success: "Recurring expense added successfully.",
    };
  } catch (error) {
    return {
      error: actionError(
        error,
        "Unable to add the recurring expense. Please try again.",
      ),
    };
  }
}

export async function updateRecurringExpense(
  id: string,
  input: RecurringExpenseInput,
): Promise<RecurringExpenseActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return {
        error: "Recurring expense not found.",
      };
    }

    const parsed = recurringExpenseSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ??
          "Please check the recurring expense details.",
      };
    }

    if (!(await validateCategoryOwnership(userId, parsed.data.categoryId))) {
      return {
        error: "The selected category is invalid.",
      };
    }

    const existing = await prisma.recurringExpense.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return {
        error: "Recurring expense not found.",
      };
    }

    await prisma.recurringExpense.update({
      where: {
        id: existing.id,
      },
      data: {
        categoryId: parsed.data.categoryId,
        amount: new Prisma.Decimal(parsed.data.amount),
        description: parsed.data.description,
        paymentMethod: parsed.data.paymentMethod,
        frequency: parsed.data.frequency,
        generationMode: parsed.data.generationMode,
        nextDueDate: toUtcDate(parsed.data.nextDueDate),
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/recurring");

    return {
      success: "Recurring expense updated successfully.",
    };
  } catch (error) {
    return {
      error: actionError(
        error,
        "Unable to update the recurring expense. Please try again.",
      ),
    };
  }
}

export async function deleteRecurringExpense(
  id: string,
): Promise<RecurringExpenseActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    const existing = await prisma.recurringExpense.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return {
        error: "Recurring expense not found.",
      };
    }

    await prisma.recurringExpense.delete({
      where: {
        id: existing.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/recurring");

    return {
      success: "Recurring expense deleted successfully.",
    };
  } catch (error) {
    return {
      error: actionError(
        error,
        "Unable to delete the recurring expense. Please try again.",
      ),
    };
  }
}

export async function toggleRecurringExpense(
  id: string,
): Promise<RecurringExpenseActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    const existing = await prisma.recurringExpense.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!existing) {
      return {
        error: "Recurring expense not found.",
      };
    }

    await prisma.recurringExpense.update({
      where: {
        id: existing.id,
      },
      data: {
        isActive: !existing.isActive,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/recurring");

    return {
      success: existing.isActive
        ? "Recurring expense paused."
        : "Recurring expense activated.",
    };
  } catch (error) {
    return {
      error: actionError(
        error,
        "Unable to change the recurring expense status.",
      ),
    };
  }
}
