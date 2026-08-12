"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  incomeSourceSchema,
  type IncomeSourceInput,
} from "@/lib/validators/income-source";

export type IncomeSourceActionResult = {
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

function getActionError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return "Your session has expired. Please sign in again.";
  }

  console.error(fallback, error);
  return fallback;
}

function revalidateIncomeSourcePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/income-sources");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard/transactions");
}

export async function createIncomeSource(
  input: IncomeSourceInput,
): Promise<IncomeSourceActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    const parsed = incomeSourceSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ??
          "Please check the income source name.",
      };
    }

    await prisma.incomeSource.create({
      data: {
        userId,
        name: parsed.data.name,
        isDefault: false,
      },
    });

    revalidateIncomeSourcePaths();

    return { success: "Income source created successfully." };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "An income source with this name already exists." };
    }

    return {
      error: getActionError(
        error,
        "Unable to create the income source. Please try again.",
      ),
    };
  }
}

export async function updateIncomeSource(
  id: string,
  input: IncomeSourceInput,
): Promise<IncomeSourceActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return { error: "Income source not found." };
    }

    const parsed = incomeSourceSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ??
          "Please check the income source name.",
      };
    }

    const existing = await prisma.incomeSource.findFirst({
      where: { id, userId },
      select: { id: true, name: true, isDefault: true },
    });

    if (!existing) {
      return { error: "Income source not found." };
    }

    if (existing.isDefault) {
      return { error: "Default income sources cannot be renamed." };
    }

    await prisma.incomeSource.update({
      where: { id: existing.id },
      data: { name: parsed.data.name },
    });

    revalidateIncomeSourcePaths();

    return { success: "Income source updated successfully." };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "An income source with this name already exists." };
    }

    return {
      error: getActionError(
        error,
        "Unable to update the income source. Please try again.",
      ),
    };
  }
}

export async function deleteIncomeSource(
  id: string,
): Promise<IncomeSourceActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return { error: "Income source not found." };
    }

    const source = await prisma.incomeSource.findFirst({
      where: { id, userId },
      select: {
        id: true,
        isDefault: true,
        _count: { select: { incomes: true } },
      },
    });

    if (!source) {
      return { error: "Income source not found." };
    }

    if (source.isDefault) {
      return { error: "Default income sources cannot be deleted." };
    }

    if (source._count.incomes > 0) {
      return {
        error:
          "This income source is used by existing income records and cannot be deleted.",
      };
    }

    await prisma.incomeSource.delete({ where: { id: source.id } });

    revalidateIncomeSourcePaths();

    return { success: "Income source deleted successfully." };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        error:
          "This income source is still referenced by income records and cannot be deleted.",
      };
    }

    return {
      error: getActionError(
        error,
        "Unable to delete the income source. Please try again.",
      ),
    };
  }
}
