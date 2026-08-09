export default function ExpensesLoading() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="h-4 w-20 rounded bg-muted/50" />
            <div className="mt-3 h-9 w-44 rounded bg-muted/50" />
            <div className="mt-3 h-4 w-80 rounded bg-muted/50" />
          </div>
          <div className="h-11 w-36 rounded-xl bg-muted/50" />
        </div>

        <div className="h-20 rounded-2xl bg-muted/40" />
        <div className="h-130 rounded-3xl bg-muted/40" />
      </div>
    </main>
  );
}
