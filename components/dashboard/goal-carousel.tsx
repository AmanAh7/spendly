"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/format";

type GoalCarouselItem = {
  id: string;
  name: string;
  categoryName: string | null;
  targetAmount: number;
  saved: number;
  remaining: number;
  progress: number;
  targetDate: string | null;
};

type GoalCarouselProps = {
  goals: GoalCarouselItem[];
  currency: string;
  dateFormat: string;
};

export function GoalCarousel({
  goals,
  currency,
  dateFormat,
}: GoalCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const hasMultiple = goals.length > 1;
  const activeGoal = goals[activeIndex] ?? goals[0];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!hasMultiple || isHovered || prefersReducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % goals.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [goals.length, hasMultiple, isHovered, prefersReducedMotion]);

  if (!activeGoal) {
    return null;
  }

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + goals.length) % goals.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % goals.length);
  }

  const progressWidth = Math.min(Math.max(activeGoal.progress, 2), 100);
  const goalStatus =
    activeGoal.remaining <= 0 ? "Target reached" : "In progress";
  const goalStatusClass =
    activeGoal.remaining <= 0 ? "text-success" : "text-muted-foreground";

  return (
    <div
      className="mt-5 min-w-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{activeGoal.name}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {activeGoal.categoryName ?? "General goal"}
          </p>
        </div>

        <div className="flex shrink-0 items-baseline gap-2">
          <span className="text-2xl font-semibold">
            {Math.round(activeGoal.progress)}%
          </span>
          <span className={`text-xs font-medium ${goalStatusClass}`}>
            {goalStatus}
          </span>
        </div>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted/50">
        <div
          className={`h-full rounded-full bg-linear-to-r from-primary to-accent ${
            prefersReducedMotion ? "" : "transition-all duration-300"
          }`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between gap-3 text-xs text-muted-foreground">
        <span>{formatCurrency(activeGoal.saved, currency)} saved</span>
        <span>{formatCurrency(activeGoal.targetAmount, currency)}</span>
      </div>

      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {activeGoal.remaining > 0
            ? `${formatCurrency(activeGoal.remaining, currency)} remaining`
            : "Target reached"}
        </span>

        {activeGoal.targetDate ? (
          <span>Target {formatDate(activeGoal.targetDate, dateFormat)}</span>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous goal"
            className="rounded-lg border border-border/60 p-1.5 text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            className="flex items-center gap-1.5"
            aria-label={`Goal ${activeIndex + 1} of ${goals.length}`}
          >
            {goals.map((goal, index) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show goal ${index + 1}`}
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
            aria-label="Next goal"
            className="rounded-lg border border-border/60 p-1.5 text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
