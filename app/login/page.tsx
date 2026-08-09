import Link from "next/link";
import { loginUser } from "@/actions/auth-actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="glass-panel-strong w-full max-w-md rounded-3xl p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Spendly</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
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
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
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

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
