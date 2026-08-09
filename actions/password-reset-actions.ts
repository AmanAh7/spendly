"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  escapeHtml,
  generatePasswordResetToken,
  getPasswordResetExpiry,
  getPasswordResetUrl,
  hashPasswordResetToken,
} from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "This reset link is invalid."),
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer.")
      .regex(/[A-Z]/, "Password must contain an uppercase letter.")
      .regex(/[a-z]/, "Password must contain a lowercase letter.")
      .regex(/[0-9]/, "Password must contain a number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type PasswordResetActionResult = {
  error?: string;
  success?: string;
};

export async function requestPasswordReset(
  formData: FormData,
): Promise<PasswordResetActionResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  const genericResponse = {
    success:
      "If an account exists for that email, you will receive a password reset link shortly.",
  };

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  const email = parsed.data.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return genericResponse;
  }

  const { rawToken, tokenHash } = generatePasswordResetToken();

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: getPasswordResetExpiry(),
      },
    }),
  ]);

  const resetUrl = getPasswordResetUrl(rawToken);

  try {
    await sendPasswordResetEmail({
      recipientEmail: user.email,
      recipientName: user.name ? escapeHtml(user.name) : null,
      resetUrl,
    });
  } catch (error) {
    console.error("Password reset email failed:", error);

    await prisma.passwordResetToken.deleteMany({
      where: {
        tokenHash,
      },
    });
  }

  return genericResponse;
}

export async function resetPassword(
  formData: FormData,
): Promise<PasswordResetActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid password reset data.",
    };
  }

  const tokenHash = hashPasswordResetToken(parsed.data.token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt.getTime() <= Date.now()
  ) {
    return {
      error: "This reset link is invalid or has expired.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma
    .$transaction(async (transaction) => {
      const currentToken = await transaction.passwordResetToken.findUnique({
        where: {
          id: resetToken.id,
        },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
          usedAt: true,
        },
      });

      if (
        !currentToken ||
        currentToken.usedAt ||
        currentToken.expiresAt.getTime() <= Date.now()
      ) {
        throw new Error("RESET_TOKEN_ALREADY_USED");
      }

      await transaction.user.update({
        where: {
          id: currentToken.userId,
        },
        data: {
          passwordHash,
        },
      });

      await transaction.passwordResetToken.update({
        where: {
          id: currentToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      await transaction.passwordResetToken.deleteMany({
        where: {
          userId: currentToken.userId,
          id: {
            not: currentToken.id,
          },
        },
      });
    })
    .catch((error: unknown) => {
      if (
        error instanceof Error &&
        error.message === "RESET_TOKEN_ALREADY_USED"
      ) {
        throw new Error("RESET_TOKEN_ALREADY_USED");
      }

      throw error;
    });

  return {
    success: "Your password has been reset successfully. You can now sign in.",
  };
}
