"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { incomeSchema, type IncomeInput } from "@/lib/validators/income";
import { isNonFutureCalendarDate } from "@/lib/utils/date-validation";

export type IncomeActionResult = {
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

async function validateIncomeSource(userId: string, sourceId: string) {
  const source = await prisma.incomeSource.findFirst({
    where: {
      id: sourceId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!source) {
    throw new Error("INCOME_SOURCE_NOT_FOUND");
  }

  return source.id;
}

function getActionError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return "Your session has expired. Please sign in again.";
    }

    if (error.message === "INCOME_SOURCE_NOT_FOUND") {
      return "The selected income source was not found.";
    }
  }

  console.error(fallback, error);
  return fallback;
}

function revalidateIncomePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/income-sources");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard/transactions");
}

export async function createIncome(
  input: IncomeInput,
): Promise<IncomeActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    const parsed = incomeSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ?? "Please check the income details.",
      };
    }

    if (!isNonFutureCalendarDate(parsed.data.date)) {
      return {
        error: "Normal income cannot have a future date.",
      };
    }

    const sourceId = await validateIncomeSource(userId, parsed.data.sourceId);

    await prisma.income.create({
      data: {
        userId,
        amount: new Prisma.Decimal(parsed.data.amount),
        description: parsed.data.description,
        sourceId,
        date: toUtcDate(parsed.data.date),
        notes: parsed.data.notes || null,
      },
    });

    revalidateIncomePaths();

    return {
      success: "Income added successfully.",
    };
  } catch (error) {
    return {
      error: getActionError(
        error,
        "Unable to add the income. Please try again.",
      ),
    };
  }
}

export async function updateIncome(
  id: string,
  input: IncomeInput,
): Promise<IncomeActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return {
        error: "Income record not found.",
      };
    }

    const parsed = incomeSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ?? "Please check the income details.",
      };
    }

    if (!isNonFutureCalendarDate(parsed.data.date)) {
      return {
        error: "Normal income cannot have a future date.",
      };
    }

    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingIncome) {
      return {
        error: "Income record not found.",
      };
    }

    const sourceId = await validateIncomeSource(userId, parsed.data.sourceId);

    await prisma.income.update({
      where: {
        id: existingIncome.id,
      },
      data: {
        amount: new Prisma.Decimal(parsed.data.amount),
        description: parsed.data.description,
        sourceId,
        date: toUtcDate(parsed.data.date),
        notes: parsed.data.notes || null,
      },
    });

    revalidateIncomePaths();

    return {
      success: "Income updated successfully.",
    };
  } catch (error) {
    return {
      error: getActionError(
        error,
        "Unable to update the income. Please try again.",
      ),
    };
  }
}

export async function deleteIncome(id: string): Promise<IncomeActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return {
        error: "Income record not found.",
      };
    }

    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingIncome) {
      return {
        error: "Income record not found.",
      };
    }

    await prisma.income.delete({
      where: {
        id: existingIncome.id,
      },
    });

    revalidateIncomePaths();

    return {
      success: "Income deleted successfully.",
    };
  } catch (error) {
    return {
      error: getActionError(
        error,
        "Unable to delete the income. Please try again.",
      ),
    };
  }
}
