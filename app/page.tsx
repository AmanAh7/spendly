"use client";

import { motion } from "framer-motion";
import { Wallet, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  {
    icon: Wallet,
    title: "Track every rupee",
    description: "Expenses, income, and budgets in one clean dashboard.",
  },
  {
    icon: TrendingUp,
    title: "Real analytics",
    description: "Trends, categories, and savings rate from your real data.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade security",
    description: "Every record is scoped to your authenticated session.",
  },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel w-full max-w-2xl rounded-3xl p-10 text-center"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl glass-panel-strong">
          <Sparkles className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Spendly
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Your finances, beautifully organized. Project foundation is live —
          authentication, dashboard, and every module ship in upcoming phases.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="glass-panel-strong rounded-2xl p-5 text-left"
            >
              <feature.icon
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-sm font-medium text-foreground">
                {feature.title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Phase 1 — Project Foundation
        </div>
      </motion.div>
    </main>
  );
}
