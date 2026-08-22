"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatCurrency } from "@/lib/format";

type BudgetCarouselItem = {
  id: string;
  name: string;
  typeLabel: string;
  amount: number;
  spent: number;
  remaining: number;
  usage: number;
  exceededAmount: number;
};

type BudgetCarouselProps = {
  budgets: BudgetCarouselItem[];
  currency: string;
};

function statusMessage(budget: BudgetCarouselItem, currency: string) {
  if (budget.usage > 100) {
    return `You've exceeded your budget by ${formatCurrency(
      budget.exceededAmount,
      currency,
    )}.`;
  }

  if (budget.usage >= 100) return "You've reached your budget limit.";
  if (budget.usage >= 90) return "You're very close to your budget limit.";
  if (budget.usage >= 75) return "You're getting close to your budget limit.";
  return "You're within your budget.";
}

export function BudgetCarousel({ budgets, currency }: BudgetCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const hasMultiple = budgets.length > 1;
  const activeBudget = budgets[activeIndex] ?? budgets[0];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!hasMultiple || isHovered || prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % budgets.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [budgets.length, hasMultiple, isHovered, prefersReducedMotion]);

  if (!activeBudget) return null;

  function showPrevious() {
    setActiveIndex(
      (current) => (current - 1 + budgets.length) % budgets.length,
    );
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % budgets.length);
  }

  const progressWidth = Math.min(Math.max(activeBudget.usage, 2), 100);
  const status = statusMessage(activeBudget, currency);

  const statusLabel =
    activeBudget.usage > 100
      ? "Over budget"
      : activeBudget.usage >= 100
        ? "Reached"
        : activeBudget.usage >= 90
          ? "Very close"
          : activeBudget.usage >= 75
            ? "Getting close"
            : "Within budget";

  const statusLabelClass =
    activeBudget.usage >= 100
      ? "text-destructive"
      : activeBudget.usage >= 75
        ? "text-warning"
        : "text-success";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mt-7 min-w-0"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{activeBudget.name}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {activeBudget.typeLabel}
        </p>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="text-3xl font-semibold">
            {Math.round(activeBudget.usage)}%
          </span>
          <span className={`text-xs font-medium ${statusLabelClass}`}>
            {statusLabel}
          </span>
        </div>

        <span className="text-right text-xs text-muted-foreground">
          {formatCurrency(activeBudget.amount, currency)}
          <br />
          planned
        </span>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted/50">
        <div
          className={`h-full rounded-full ${
            activeBudget.usage >= 100
              ? "bg-destructive"
              : activeBudget.usage >= 90
                ? "bg-warning"
                : "bg-success"
          } ${prefersReducedMotion ? "" : "transition-all duration-300"}`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatCurrency(activeBudget.spent, currency)} spent</span>
        <span>
          {activeBudget.exceededAmount > 0
            ? `${formatCurrency(activeBudget.exceededAmount, currency)} over budget`
            : `${formatCurrency(activeBudget.remaining, currency)} remaining`}
        </span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{status}</p>

      {hasMultiple ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous budget"
            className="rounded-lg border border-border/60 p-1.5 text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            className="flex items-center gap-1.5"
            aria-label={`Budget ${activeIndex + 1} of ${budgets.length}`}
          >
            {budgets.map((budget, index) => (
              <button
                key={budget.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show budget ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/40 hover:bg-primary/60"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={showNext}
            aria-label="Next budget"
            className="rounded-lg border border-border/60 p-1.5 text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
