"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  resetPassword,
  type PasswordResetActionResult,
} from "@/actions/password-reset-actions";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [result, setResult] = useState<PasswordResetActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("token", token);

    startTransition(async () => {
      try {
        const response = await resetPassword(formData);
        setResult(response);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "RESET_TOKEN_ALREADY_USED"
        ) {
          setResult({
            error: "This reset link is invalid or has expired.",
          });
          return;
        }

        setResult({
          error: "Something went wrong. Please request a new reset link.",
        });
      }
    });
  }

  return (
    <section className="glass-panel-strong w-full max-w-md rounded-3xl p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Spendly</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a strong password for your Spendly account.
        </p>
      </div>

      {result?.error ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {result.error}
        </div>
      ) : null}

      {result?.success ? (
        <div
          role="status"
          className="mb-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {result.success}
          <Link href="/login" className="ml-1 font-medium underline">
            Sign in
          </Link>
        </div>
      ) : null}

      {!result?.success ? (
        <form action={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Repeat your password"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Use uppercase, lowercase, and a number.
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isPending ? "Resetting password..." : "Reset password"}
          </button>
        </form>
      ) : null}
    </section>
  );
}
