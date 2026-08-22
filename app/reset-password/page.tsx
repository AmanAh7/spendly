import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <AuthPageShell>
        <section className="text-center">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">Spendly</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Invalid reset link
            </h1>
            <p className="mt-3 text-sm text-white/65">
              This password reset link is missing or invalid.
            </p>
          </div>

          <Link
            href="/forgot-password"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Request a new link
          </Link>
        </section>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <ResetPasswordForm token={token} />
    </AuthPageShell>
  );
}
