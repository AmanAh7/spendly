"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { incomeSchema, type IncomeInput } from "@/lib/validators/income";

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

    await prisma.income.create({
      data: {
        userId,
        amount: new Prisma.Decimal(parsed.data.amount),
        description: parsed.data.description,
        source: parsed.data.source,
        date: toUtcDate(parsed.data.date),
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/income");

    return {
      success: "Income added successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Create income error:", error);

    return {
      error: "Unable to add the income. Please try again.",
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

    await prisma.income.update({
      where: {
        id: existingIncome.id,
      },
      data: {
        amount: new Prisma.Decimal(parsed.data.amount),
        description: parsed.data.description,
        source: parsed.data.source,
        date: toUtcDate(parsed.data.date),
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/income");

    return {
      success: "Income updated successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Update income error:", error);

    return {
      error: "Unable to update the income. Please try again.",
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

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/income");

    return {
      success: "Income deleted successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Delete income error:", error);

    return {
      error: "Unable to delete the income. Please try again.",
    };
  }
}
