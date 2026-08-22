"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  changePasswordSchema,
  type ChangePasswordInput,
  deleteAccountSchema,
  type DeleteAccountInput,
  settingsSchema,
  type SettingsInput,
} from "@/lib/validators/settings";

export type SettingsActionResult = {
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

export async function updateSettings(
  input: SettingsInput,
): Promise<SettingsActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    const parsed = settingsSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ??
          "Please check your settings and try again.",
      };
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: parsed.data.name,
        currency: parsed.data.currency,
        theme: "dark", // force dark for DB compatibility
        dateFormat: parsed.data.dateFormat,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/goals");

    return {
      success: "Settings updated successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Update settings error:", error);

    return {
      error: "Unable to update your settings. Please try again.",
    };
  }
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<SettingsActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    const userId = session.user.id;
    const parsed = changePasswordSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ??
          "Please check your details and try again.",
      };
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return {
        error: "Unable to change your password. Please try again.",
      };
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return {
        error: "Current password is incorrect.",
      };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        usedAt: null,
      },
    });

    return {
      success: "Password changed successfully.",
    };
  } catch (error) {
    console.error("Change password error:", error);

    return {
      error: "Unable to change your password. Please try again.",
    };
  }
}

export async function deleteAccount(
  input: DeleteAccountInput,
): Promise<SettingsActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    const userId = session.user.id;
    const parsed = deleteAccountSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ??
          "Please check your account deletion details and try again.",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return {
        error: "Unable to delete your account. Please try again.",
      };
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return {
        error: "Current password is incorrect.",
      };
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return {
      success: "Your account has been deleted.",
    };
  } catch (error) {
    console.error("Delete account error:", error);

    return {
      error: "Unable to delete your account. Please try again.",
    };
  }
}
