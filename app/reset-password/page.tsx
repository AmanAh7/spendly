import Link from "next/link";

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
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <section className="glass-panel-strong w-full max-w-md rounded-3xl p-8 text-center">
          <p className="text-sm font-medium text-primary">Spendly</p>
          <h1 className="mt-2 text-3xl font-semibold">Invalid reset link</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This password reset link is missing or invalid.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Request a new link
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <ResetPasswordForm token={token} />
    </main>
  );
}
