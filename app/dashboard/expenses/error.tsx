"use client";

export default function ExpensesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <section className="glass-panel-strong w-full max-w-md rounded-3xl p-8 text-center">
        <h1 className="text-xl font-semibold">Expenses unavailable</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          We could not load your expenses. Please try again.
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
