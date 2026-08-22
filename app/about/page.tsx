import Link from "next/link";
import {
  WalletCards,
  ChartNoAxesCombined,
  ChartColumn,
  Target,
  RefreshCw,
  BarChart3,
  Compass,
  ListChecks,
  Trophy,
  ArrowRight,
} from "lucide-react";

const FEATURE_CARDS = [
  {
    icon: WalletCards,
    title: "Track your income",
    description:
      "See every paycheck and side income land in one focused place.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Understand your spending",
    description:
      "Turn everyday transactions into patterns you can actually use.",
  },
  {
    icon: ChartColumn,
    title: "Build better budgets",
    description:
      "Create realistic budgets that adapt to how you live, not the other way around.",
  },
  {
    icon: Target,
    title: "Work toward your goals",
    description:
      "Set savings goals and watch your progress without the guesswork.",
  },
  {
    icon: RefreshCw,
    title: "Never forget recurring expenses",
    description:
      "Keep subscriptions and bills in view so nothing slips through the cracks.",
  },
  {
    icon: BarChart3,
    title: "See the bigger picture",
    description:
      "Understand where your money is going and where it could be going instead.",
  },
];

const PHILOSOPHY_CARDS = [
  {
    icon: Compass,
    title: "Plan",
    description:
      "Start with intention. Know what matters and give your money a clear direction.",
  },
  {
    icon: ListChecks,
    title: "Track",
    description:
      "Capture the reality of your spending without judgment or unnecessary detail.",
  },
  {
    icon: Trophy,
    title: "Achieve",
    description:
      "Celebrate progress, adjust when needed, and keep moving toward what matters.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle ambient background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        >
          <div className="absolute -left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              About Spendly
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your money deserves more than a spreadsheet.
            </h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
              Spendly brings your income, spending, budgets, and goals into one
              calm, focused view. No noise. No overwhelm. Just a clearer
              understanding of where your money is going and where it could be
              going instead.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Get Started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Explore Spendly
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Built Spendly */}
      <section className="border-t border-border/60 bg-background/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Why We Built Spendly
            </h2>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              Money management shouldn&apos;t feel like a part-time job. Yet
              between spreadsheets, banking apps, budgeting tools, and
              subscriptions, it often does. Spendly was built to replace that
              fragmentation with something calmer and more coherent: a single
              place where you can see what came in, what went out, what you are
              planning, and how your goals are moving.
            </p>
          </div>
        </div>
      </section>

      {/* One Place for Your Financial Life */}
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              One Place for Your Financial Life
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Six focused pieces that work together.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-panel-strong rounded-3xl p-6"
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Built Around Clarity */}
      <section className="border-t border-border/60 bg-background/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Built Around Clarity
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Less noise. More understanding. Spendly is designed so you can
              answer the questions that actually matter:
            </p>
            <ul className="mt-6 space-y-3 text-base leading-7 text-muted-foreground">
              <li>• How much did I spend this month?</li>
              <li>• On what?</li>
              <li>• How does that compare to last month?</li>
              <li>• Am I on track with my budget?</li>
              <li>• Am I moving toward my goals?</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Our Philosophy
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Personal finance, simplified.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {PHILOSOPHY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="glass-panel-strong rounded-3xl p-6 text-center"
                >
                  <Icon
                    className="mx-auto h-6 w-6 text-primary"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Designed for Real Life */}
      <section className="border-t border-border/60 bg-background/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Designed for Real Life
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Financial progress is not about perfection. It is about small,
              consistent steps in the right direction. Spendly is built to
              support both the everyday decisions and the long-term goals that
              shape your financial life.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Comes First */}
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Privacy Comes First
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Your financial data is deeply personal. Spendly is designed to
              keep it that way.
            </p>
            <div className="mt-8 glass-panel-strong rounded-3xl p-6">
              <p className="text-base font-semibold text-foreground">
                Your money. Your data. Your decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Spendly Experience */}
      <section className="border-t border-border/60 bg-background/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              The Spendly Experience
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Spendly supports both the everyday reality of spending and the
              longer arc of your financial goals. You get a calm, focused view
              of your money that helps you make clearer decisions without the
              noise of traditional finance apps.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
        >
          <div className="absolute left-1/4 top-0 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Ready to take control?
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Give your money a better system.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get Started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
