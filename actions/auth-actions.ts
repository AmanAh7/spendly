"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128, "Password must be 128 characters or fewer.")
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/[a-z]/, "Password must contain a lowercase letter.")
    .regex(/[0-9]/, "Password must contain a number."),
});

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function registerUser(formData: FormData): Promise<ActionResult> {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid registration details.",
    };
  }

  const email = parsed.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      currency: "INR",
      theme: "system",
      dateFormat: "DD/MM/YYYY",
    },
  });

  return {
    success: "Account created successfully. You can now sign in.",
  };
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  if (!email || !password) {
    redirect("/login?error=Please%20enter%20your%20email%20and%20password.");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=Invalid%20email%20or%20password.");
    }

    throw error;
  }
}
