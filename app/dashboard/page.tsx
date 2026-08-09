import { signOut } from "@/auth";

export default async function DashboardPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <section className="mx-auto max-w-4xl">
        <div className="glass-panel-strong rounded-3xl p-8">
          <p className="text-sm font-medium text-primary">Spendly</p>

          <h1 className="mt-2 text-3xl font-semibold">
            Authentication is working
          </h1>

          <p className="mt-3 text-muted-foreground">
            You are viewing a protected dashboard route.
          </p>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            className="mt-6"
          >
            <button
              type="submit"
              className="rounded-xl border border-border px-4 py-2 text-sm transition hover:border-primary hover:text-primary"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
