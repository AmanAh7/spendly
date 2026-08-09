"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <section className="glass-panel-strong w-full max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          !
        </div>

        <h1 className="mt-5 text-xl font-semibold">Dashboard unavailable</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          We could not load your financial data. Please try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
