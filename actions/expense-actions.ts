"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema, type ExpenseInput } from "@/lib/validators/expense";

export type ExpenseActionResult = {
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

export async function createExpense(
  input: ExpenseInput,
): Promise<ExpenseActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    const parsed = expenseSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ??
          "Please check the expense details.",
      };
    }

    const categoryOwned = await validateCategoryOwnership(
      userId,
      parsed.data.categoryId,
    );

    if (!categoryOwned) {
      return {
        error: "The selected category is invalid.",
      };
    }

    await prisma.expense.create({
      data: {
        userId,
        categoryId: parsed.data.categoryId,
        amount: new Prisma.Decimal(parsed.data.amount),
        description: parsed.data.description,
        paymentMethod: parsed.data.paymentMethod,
        date: toUtcDate(parsed.data.date),
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");

    return {
      success: "Expense added successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Create expense error:", error);

    return {
      error: "Unable to add the expense. Please try again.",
    };
  }
}

export async function updateExpense(
  id: string,
  input: ExpenseInput,
): Promise<ExpenseActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return {
        error: "Expense not found.",
      };
    }

    const parsed = expenseSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ??
          "Please check the expense details.",
      };
    }

    const categoryOwned = await validateCategoryOwnership(
      userId,
      parsed.data.categoryId,
    );

    if (!categoryOwned) {
      return {
        error: "The selected category is invalid.",
      };
    }

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingExpense) {
      return {
        error: "Expense not found.",
      };
    }

    await prisma.expense.update({
      where: {
        id: existingExpense.id,
      },
      data: {
        categoryId: parsed.data.categoryId,
        amount: new Prisma.Decimal(parsed.data.amount),
        description: parsed.data.description,
        paymentMethod: parsed.data.paymentMethod,
        date: toUtcDate(parsed.data.date),
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");

    return {
      success: "Expense updated successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Update expense error:", error);

    return {
      error: "Unable to update the expense. Please try again.",
    };
  }
}

export async function deleteExpense(id: string): Promise<ExpenseActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return {
        error: "Expense not found.",
      };
    }

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingExpense) {
      return {
        error: "Expense not found.",
      };
    }

    await prisma.expense.delete({
      where: {
        id: existingExpense.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");

    return {
      success: "Expense deleted successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Delete expense error:", error);

    return {
      error: "Unable to delete the expense. Please try again.",
    };
  }
}
