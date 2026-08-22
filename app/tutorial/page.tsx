"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Wallet,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Target,
  ListChecks,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  ArrowDown,
  ArrowRight as ArrowRightIcon,
  DollarSign,
  ShoppingCart,
  Receipt,
} from "lucide-react";

const QUICK_START_STEPS = [
  {
    number: "01",
    icon: Wallet,
    title: "Create your account",
    description:
      "Set up your Spendly account and create your personal financial workspace.",
  },
  {
    number: "02",
    icon: TrendingUp,
    title: "Add your income",
    description:
      "Record your income sources so Spendly can understand the money coming in.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Track your expenses",
    description:
      "Start recording your everyday spending and organize it into meaningful categories.",
  },
  {
    number: "04",
    icon: PiggyBank,
    title: "Set your budgets",
    description:
      "Create spending limits for the categories that matter most to you.",
  },
  {
    number: "05",
    icon: Target,
    title: "Set your goals",
    description:
      "Turn your financial plans into measurable goals and track your progress.",
  },
  {
    number: "06",
    icon: BarChart3,
    title: "Understand your finances",
    description:
      "Use the dashboard and analytics to see where your money is going and make better decisions.",
  },
];

const TUTORIAL_CHAPTERS = [
  {
    number: "01",
    id: "dashboard",
    icon: Wallet,
    title: "Your financial overview",
    section: "Dashboard",
    description:
      "The dashboard brings together your available balance, income, expenses, budgets, goals, recent transactions, and financial insights.",
  },
  {
    number: "02",
    id: "income",
    icon: TrendingUp,
    title: "Know what's coming in.",
    section: "Income",
    description:
      "Add income, track income sources, monitor monthly income, and understand income patterns.",
  },
  {
    number: "03",
    id: "expenses",
    icon: CreditCard,
    title: "Know where your money goes.",
    section: "Expenses",
    description:
      "Add expenses, categorize spending, track spending patterns, and review expense history.",
  },
  {
    number: "04",
    id: "budgets",
    icon: PiggyBank,
    title: "Give every part of your spending a limit.",
    section: "Budgets",
    description:
      "Create category budgets, monitor progress, see remaining budget, and identify overspending.",
  },
  {
    number: "05",
    id: "goals",
    icon: Target,
    title: "Turn plans into progress.",
    section: "Goals",
    description:
      "Create financial goals, set target amounts, track progress, and monitor remaining amounts.",
  },
  {
    number: "06",
    id: "transactions",
    icon: ListChecks,
    title: "See the complete picture.",
    section: "Transactions",
    description:
      "View your income and expenses together in one timeline. Search, filter, sort by type, date, and amount.",
  },
  {
    number: "07",
    id: "analytics",
    icon: BarChart3,
    title: "Understand your patterns.",
    section: "Analytics",
    description:
      "Review spending trends, income and expense comparisons, category patterns, changes over time, and financial summaries.",
  },
];

const TIPS = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Keep your transactions up to date",
    description:
      "Regular updates give you a clearer picture of your financial habits.",
  },
  {
    number: "02",
    icon: CheckCircle2,
    title: "Use categories consistently",
    description:
      "Consistent categorization makes your spending patterns easier to understand.",
  },
  {
    number: "03",
    icon: PiggyBank,
    title: "Set realistic budgets",
    description: "Budgets work best when they reflect how you actually spend.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Review your progress",
    description:
      "Use your dashboard and analytics regularly to see how your financial decisions are adding up.",
  },
];

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick Start" },
  { id: "dashboard", label: "Dashboard" },
  { id: "income", label: "Income" },
  { id: "expenses", label: "Expenses" },
  { id: "budgets", label: "Budgets" },
  { id: "goals", label: "Goals" },
  { id: "transactions", label: "Transactions" },
  { id: "analytics", label: "Analytics" },
  { id: "tips", label: "Tips" },
];

// ---------- Chapter Previews ----------

function ChapterPreview({ chapterId }: { chapterId: string }) {
  switch (chapterId) {
    case "dashboard":
      return <DashboardPreview />;
    case "income":
      return <IncomePreview />;
    case "expenses":
      return <ExpensesPreview />;
    case "budgets":
      return <BudgetsPreview />;
    case "goals":
      return <GoalsPreview />;
    case "transactions":
      return <TransactionsPreview />;
    case "analytics":
      return <AnalyticsPreview />;
    default:
      return null;
  }
}

function DashboardPreview() {
  return (
    <div className="mt-4 w-full rounded-xl border border-border bg-background/40 p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Available balance</p>
          <p className="mt-1 text-lg font-semibold text-foreground">₹4,280</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Monthly income</p>
          <p className="mt-1 text-lg font-semibold text-foreground">₹5,200</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Monthly spending</p>
          <p className="mt-1 text-lg font-semibold text-foreground">₹3,140</p>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="mt-4" aria-hidden="true">
        <div className="flex items-end gap-2 h-20">
          <div
            className="w-1/6 bg-primary/40 rounded-t"
            style={{ height: "60%" }}
          />
          <div
            className="w-1/6 bg-primary/60 rounded-t"
            style={{ height: "80%" }}
          />
          <div
            className="w-1/6 bg-primary/80 rounded-t"
            style={{ height: "50%" }}
          />
          <div
            className="w-1/6 bg-primary/50 rounded-t"
            style={{ height: "70%" }}
          />
          <div
            className="w-1/6 bg-primary/70 rounded-t"
            style={{ height: "90%" }}
          />
          <div
            className="w-1/6 bg-primary rounded-t"
            style={{ height: "65%" }}
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div>
            <p className="text-sm font-medium text-foreground">Salary</p>
            <p className="text-xs text-muted-foreground">Income</p>
          </div>
          <span className="text-sm font-semibold text-emerald-400">
            +₹5,200
          </span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div>
            <p className="text-sm font-medium text-foreground">Groceries</p>
            <p className="text-xs text-muted-foreground">Expenses</p>
          </div>
          <span className="text-sm font-semibold text-rose-400">-₹240</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Preview — Example data
      </p>
    </div>
  );
}

function IncomePreview() {
  return (
    <div className="mt-4 w-full rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Monthly income total</p>
          <p className="mt-1 text-xl font-semibold text-foreground">₹5,200</p>
        </div>
        <TrendingUp className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <DollarSign
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm text-foreground">Salary</span>
          </div>
          <span className="text-sm font-semibold text-foreground">₹4,500</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <BriefcaseIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm text-foreground">Freelance</span>
          </div>
          <span className="text-sm font-semibold text-foreground">₹600</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <Lightbulb
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm text-foreground">Other</span>
          </div>
          <span className="text-sm font-semibold text-foreground">₹100</span>
        </div>
      </div>

      {/* Trend bars */}
      <div className="mt-4" aria-hidden="true">
        <div className="flex items-end gap-1 h-16">
          <div
            className="flex-1 bg-primary/30 rounded-t"
            style={{ height: "50%" }}
          />
          <div
            className="flex-1 bg-primary/50 rounded-t"
            style={{ height: "70%" }}
          />
          <div
            className="flex-1 bg-primary/70 rounded-t"
            style={{ height: "60%" }}
          />
          <div
            className="flex-1 bg-primary rounded-t"
            style={{ height: "90%" }}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Preview — Example data
      </p>
    </div>
  );
}

function ExpensesPreview() {
  return (
    <div className="mt-4 w-full rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Monthly spending total
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground">₹3,140</p>
        </div>
        <ShoppingCart className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <Receipt
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm text-foreground">Food</span>
          </div>
          <span className="text-sm font-semibold text-foreground">₹520</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <CreditCard
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm text-foreground">Transport</span>
          </div>
          <span className="text-sm font-semibold text-foreground">₹280</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <DollarSign
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm text-foreground">Bills</span>
          </div>
          <span className="text-sm font-semibold text-foreground">₹1,200</span>
        </div>
      </div>

      {/* Category bars */}
      <div className="mt-4 space-y-2" aria-hidden="true">
        <div className="h-2 w-full rounded-full bg-border">
          <div
            className="h-2 rounded-full bg-primary"
            style={{ width: "65%" }}
          />
        </div>
        <div className="h-2 w-full rounded-full bg-border">
          <div
            className="h-2 rounded-full bg-primary/70"
            style={{ width: "40%" }}
          />
        </div>
        <div className="h-2 w-full rounded-full bg-border">
          <div
            className="h-2 rounded-full bg-primary/50"
            style={{ width: "80%" }}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Preview — Example data
      </p>
    </div>
  );
}

function BudgetsPreview() {
  return (
    <div className="mt-4 w-full rounded-xl border border-border bg-background/40 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Total budget</p>
          <p className="mt-1 text-lg font-semibold text-foreground">₹3,500</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Used</p>
          <p className="mt-1 text-lg font-semibold text-foreground">₹2,180</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="mt-1 text-lg font-semibold text-foreground">₹1,320</p>
        </div>
      </div>

      {/* Category progress */}
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground">Food</span>
            <span className="text-muted-foreground">₹420 / ₹500</span>
          </div>
          <div
            className="mt-1 h-2 w-full rounded-full bg-border"
            aria-hidden="true"
          >
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: "84%" }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground">Transport</span>
            <span className="text-muted-foreground">₹180 / ₹300</span>
          </div>
          <div
            className="mt-1 h-2 w-full rounded-full bg-border"
            aria-hidden="true"
          >
            <div
              className="h-2 rounded-full bg-primary/70"
              style={{ width: "60%" }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground">Entertainment</span>
            <span className="text-muted-foreground">₹280 / ₹300</span>
          </div>
          <div
            className="mt-1 h-2 w-full rounded-full bg-border"
            aria-hidden="true"
          >
            <div
              className="h-2 rounded-full bg-rose-500"
              style={{ width: "93%" }}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Preview — Example data
      </p>
    </div>
  );
}

function GoalsPreview() {
  return (
    <div className="mt-4 w-full rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Emergency fund</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            ₹8,400 / ₹10,000
          </p>
        </div>
        <Target className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>

      <div className="mt-3" aria-hidden="true">
        <div className="h-3 w-full rounded-full bg-border">
          <div
            className="h-3 rounded-full bg-primary"
            style={{ width: "84%" }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Saved</span>
        <span className="font-semibold text-foreground">₹8,400</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Remaining</span>
        <span className="font-semibold text-foreground">₹1,600</span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Preview — Example data
      </p>
    </div>
  );
}

function TransactionsPreview() {
  return (
    <div className="mt-4 w-full rounded-xl border border-border bg-background/40 p-4">
      {/* Search/filter presentation */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className="h-9 flex-1 rounded-lg border border-border bg-background/60 px-3 text-sm text-muted-foreground"
          aria-hidden="true"
        >
          Search transactions...
        </div>
        <div
          className="h-9 w-24 rounded-lg border border-border bg-background/60"
          aria-hidden="true"
        />
      </div>

      {/* Transaction rows */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"
              aria-hidden="true"
            >
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Salary</p>
              <p className="text-xs text-muted-foreground">Aug 1 • Income</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-emerald-400">
            +₹5,200
          </span>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"
              aria-hidden="true"
            >
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Groceries</p>
              <p className="text-xs text-muted-foreground">Aug 3 • Expenses</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-rose-400">-₹240</span>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"
              aria-hidden="true"
            >
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Electric bill
              </p>
              <p className="text-xs text-muted-foreground">Aug 5 • Expenses</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-rose-400">-₹120</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Preview — Example data
      </p>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="mt-4 w-full rounded-xl border border-border bg-background/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Spending trend</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            -8% vs last month
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Top category</p>
          <p className="mt-1 text-lg font-semibold text-foreground">Bills</p>
        </div>
      </div>

      {/* Income vs expenses bars */}
      <div className="mt-4" aria-hidden="true">
        <div className="flex items-end gap-3 h-24">
          <div
            className="w-1/2 bg-primary/40 rounded-t"
            style={{ height: "70%" }}
          />
          <div
            className="w-1/2 bg-primary rounded-t"
            style={{ height: "50%" }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Income</span>
          <span>Expenses</span>
        </div>
      </div>

      {/* Category trend */}
      <div className="mt-4 space-y-2" aria-hidden="true">
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground">Food</span>
          <span className="text-muted-foreground">+12%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border">
          <div
            className="h-1.5 rounded-full bg-primary/70"
            style={{ width: "60%" }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground">Transport</span>
          <span className="text-muted-foreground">-5%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border">
          <div
            className="h-1.5 rounded-full bg-primary/50"
            style={{ width: "40%" }}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Preview — Example data
      </p>
    </div>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

// ---------- Flowchart ----------

function FinanceFlowchart() {
  const stages = [
    {
      number: "1",
      icon: TrendingUp,
      title: "Income",
      description: "Know what comes in.",
    },
    {
      number: "2",
      icon: CreditCard,
      title: "Expenses",
      description: "See where money goes.",
    },
    {
      number: "3",
      icon: PiggyBank,
      title: "Budgets",
      description: "Set useful limits.",
    },
    {
      number: "4",
      icon: Target,
      title: "Goals",
      description: "Turn plans into targets.",
    },
    {
      number: "5",
      icon: BarChart3,
      title: "Analytics",
      description: "Understand patterns.",
    },
    {
      number: "6",
      icon: CheckCircle2,
      title: "Better decisions",
      description: "Act with clarity.",
    },
  ];

  return (
    <div className="mt-12">
      {/* Desktop horizontal */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-center gap-4">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={stage.title} className="flex items-center">
                <div className="glass-panel-strong rounded-xl p-4 w-40 text-center">
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Step {stage.number}
                  </span>
                  <Icon
                    className="mx-auto mt-2 h-6 w-6 text-primary"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {stage.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stage.description}
                  </p>
                </div>
                {idx < stages.length - 1 && (
                  <ArrowRightIcon
                    className="mx-2 h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile vertical */}
      <div className="lg:hidden">
        <div className="flex flex-col items-center gap-4">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={stage.title} className="flex flex-col items-center">
                <div className="glass-panel-strong rounded-xl p-4 w-full max-w-xs text-center">
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Step {stage.number}
                  </span>
                  <Icon
                    className="mx-auto mt-2 h-6 w-6 text-primary"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {stage.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stage.description}
                  </p>
                </div>
                {idx < stages.length - 1 && (
                  <ArrowDown
                    className="mt-2 h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Navigation ----------

function TutorialNav({
  activeId,
  onNavigate,
}: {
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Tutorial navigation"
      className="sticky top-4 z-20 hidden lg:block"
    >
      <div className="glass-panel-strong rounded-2xl p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`block w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "border-purple-600 bg-purple-600 text-white"
                      : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-background/40 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function MobileNav({
  activeId,
  onNavigate,
}: {
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Tutorial navigation"
      className="sticky top-0 z-20 border-y border-border/60 bg-background/90 py-3 backdrop-blur-xl lg:hidden"
    >
      <div className="overflow-x-auto">
        <div className="flex gap-2 px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? "true" : undefined}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-background/40 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ---------- Page ----------

export default function TutorialPage() {
  const [activeId, setActiveId] = useState("overview");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const sectionElements = NAV_ITEMS.map((item) =>
      document.getElementById(item.id),
    ).filter((element): element is HTMLElement => Boolean(element));

    const updateActiveSection = () => {
      const offset = 140;
      let currentId = "overview";

      for (const section of sectionElements) {
        if (section.getBoundingClientRect().top <= offset) {
          currentId = section.id;
        }
      }

      setActiveId((previousId) =>
        previousId === currentId ? previousId : currentId,
      );
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  function handleNavigate(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
      setActiveId(id);
    }
  }

  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero */}
      <section id="overview" className="relative overflow-hidden">
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
              GETTING STARTED
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Take control of your money, one step at a time.
            </h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
              Learn how to use Spendly to track your money, understand your
              spending, plan ahead, and build better financial habits.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleNavigate("quick-start")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Start the Tutorial
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
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

      {/* Quick Start */}
      <section
        id="quick-start"
        className="border-t border-border/60 bg-background/40"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Your first few minutes with Spendly
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Set up the essentials first. You can refine everything else as you
              go.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_START_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="glass-panel-strong rounded-3xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {step.number}
                    </span>
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tutorial Chapters */}
      <section className="border-t border-border/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Everything you need in one place.
            </h2>
          </div>

          {/* Mobile nav placed immediately after heading */}
          <div className="mt-8 lg:hidden">
            <MobileNav activeId={activeId} onNavigate={handleNavigate} />
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {TUTORIAL_CHAPTERS.map((chapter) => {
                  const Icon = chapter.icon;
                  return (
                    <div
                      key={chapter.id}
                      id={chapter.id}
                      className="scroll-mt-24 glass-panel-strong rounded-3xl p-6"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          {chapter.number}
                        </span>
                        <Icon
                          className="h-5 w-5 text-primary"
                          aria-hidden="true"
                        />
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          {chapter.section}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-foreground">
                        {chapter.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {chapter.description}
                      </p>

                      <ChapterPreview chapterId={chapter.id} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:block">
              <TutorialNav activeId={activeId} onNavigate={handleNavigate} />
            </div>
          </div>
        </div>
      </section>

      {/* How Spendly Fits Together */}
      <section className="relative overflow-hidden border-t border-border/60 bg-background/40">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
        >
          <div className="absolute left-1/4 top-0 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              From tracking to understanding.
            </h2>
          </div>

          <FinanceFlowchart />
        </div>
      </section>

      {/* Tips */}
      <section id="tips" className="border-t border-border/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Make Spendly work harder for you.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TIPS.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="glass-panel-strong rounded-3xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {tip.number}
                    </span>
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-border/60 bg-background/40">
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
            Your financial journey starts with understanding where your money is
            today.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Open My Dashboard
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
