"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  requestPasswordReset,
  type PasswordResetActionResult,
} from "@/actions/password-reset-actions";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function ForgotPasswordPage() {
  const [result, setResult] = useState<PasswordResetActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = await requestPasswordReset(formData);
      setResult(response);
    });
  }

  return (
    <AuthPageShell>
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Spendly</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-white/65">
          Enter your email and we&apos;ll send you a secure reset link.
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
        </div>
      ) : null}

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-white/90"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isPending ? "Sending link..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
