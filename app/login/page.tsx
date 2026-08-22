import Link from "next/link";

import { loginUser } from "@/actions/auth-actions";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { PasswordVisibilityInput } from "@/components/auth/password-visibility-input";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthPageShell>
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Spendly</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-white/65">
          Sign in to manage your personal finances.
        </p>
      </div>

      {params.error ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {params.error}
        </div>
      ) : null}

      <form action={loginUser} className="space-y-5">
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/90"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Forgot password?
            </Link>
          </div>

          <PasswordVisibilityInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-xl border border-white/15 bg-black/25 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Create one
        </Link>
      </p>
    </AuthPageShell>
  );
}
