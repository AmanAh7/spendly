"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { registerUser, type ActionResult } from "@/actions/auth-actions";

export default function RegisterPage() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = await registerUser(formData);
      setResult(response);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="glass-panel-strong w-full max-w-md rounded-3xl p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Spendly</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start organizing your complete financial life.
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
            {result.success}{" "}
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          </div>
        ) : null}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
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
            <p className="mt-2 text-xs text-muted-foreground">
              Use uppercase, lowercase, and a number.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
