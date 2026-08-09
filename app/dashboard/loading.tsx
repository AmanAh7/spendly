export default function DashboardLoading() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-10 w-56 rounded-xl bg-muted/50" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-3xl bg-muted/40" />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-96 rounded-3xl bg-muted/40" />
          <div className="h-96 rounded-3xl bg-muted/40" />
        </div>
      </div>
    </main>
  );
}
