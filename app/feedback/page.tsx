"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, Bug, Sparkles, ArrowRight, Star } from "lucide-react";

const FEEDBACK_TYPES = [
  { value: "feature", label: "Feature request" },
  { value: "improvement", label: "Improvement" },
  { value: "bug", label: "Bug report" },
  { value: "general", label: "General feedback" },
] as const;

const PRODUCT_AREAS = [
  { value: "", label: "Select an area (optional)" },
  { value: "dashboard", label: "Dashboard" },
  { value: "income", label: "Income" },
  { value: "expenses", label: "Expenses" },
  { value: "budgets", label: "Budgets" },
  { value: "goals", label: "Goals" },
  { value: "transactions", label: "Transactions" },
  { value: "analytics", label: "Analytics" },
  { value: "other", label: "Other" },
] as const;

const CATEGORY_CARDS = [
  {
    icon: Lightbulb,
    number: "01",
    title: "IDEAS",
    description:
      "Have an idea for a feature or a better way to manage your finances?",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "EXPERIENCE",
    description:
      "Tell us what feels confusing, slow, or harder than it should be.",
  },
  {
    icon: Bug,
    number: "03",
    title: "BUGS",
    description:
      "Found something that isn't working correctly? Let us know so we can investigate.",
  },
];

function RatingControl({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (value: number) => void;
  disabled: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2"
      role="radiogroup"
      aria-label="How would you rate your experience with Spendly?"
    >
      {[1, 2, 3, 4, 5].map((rating) => {
        const isSelected = value === rating;

        return (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${rating} out of 5 stars`}
            disabled={disabled}
            onClick={() => onChange(rating)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/40 text-muted-foreground hover:border-primary"
            }`}
          >
            <Star
              className={`h-5 w-5 ${isSelected ? "fill-current" : ""}`}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

export default function FeedbackPage() {
  const [formState, setFormState] = useState<"idle" | "submitting">("idle");
  const [rating, setRating] = useState<number | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formState === "submitting") {
      return;
    }

    setFormState("submitting");
    setFormMessage(
      "This form is not connected yet. Please email amanahamed021@gmail.com directly.",
    );

    window.setTimeout(() => {
      setFormState("idle");
    }, 800);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <section className="relative overflow-hidden">
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
              SHAPE SPENDLY
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Help us make Spendly better.
            </h1>

            <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
              Your feedback helps us understand what&apos;s working, what
              isn&apos;t, and what we should build next.
            </p>

            <p className="mt-4 text-sm text-muted-foreground">
              Every suggestion helps us build a smarter financial experience.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-background/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Tell us what you think.
              </h2>

              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Whether you have an idea, found something that could be
                improved, or simply want to share your experience, we&apos;d
                love to hear from you.
              </p>
            </div>

            <div
              id="feedback-form"
              className="glass-panel-strong mt-10 rounded-3xl p-6 sm:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="feedback-name"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Name
                  </label>

                  <input
                    id="feedback-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Your name"
                    disabled={formState === "submitting"}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-email"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>

                  <input
                    id="feedback-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    disabled={formState === "submitting"}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-type"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Feedback type
                  </label>

                  <select
                    id="feedback-type"
                    name="type"
                    required
                    defaultValue="general"
                    disabled={formState === "submitting"}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {FEEDBACK_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset>
                  <legend className="mb-2 block text-sm font-medium text-foreground">
                    How would you rate your experience with Spendly?
                  </legend>

                  <RatingControl
                    value={rating}
                    onChange={setRating}
                    disabled={formState === "submitting"}
                  />

                  <input
                    type="hidden"
                    name="rating"
                    value={rating ?? ""}
                    readOnly
                  />
                </fieldset>

                <div>
                  <label
                    htmlFor="feedback-message"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    What would you like us to know?
                  </label>

                  <textarea
                    id="feedback-message"
                    name="feedback"
                    rows={5}
                    required
                    placeholder="Tell us what you think, what could be better, or what you'd like to see next..."
                    disabled={formState === "submitting"}
                    className="w-full resize-y rounded-xl border border-input bg-background/40 px-3 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-area"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Which part of Spendly are you referring to?
                  </label>

                  <select
                    id="feedback-area"
                    name="area"
                    disabled={formState === "submitting"}
                    defaultValue=""
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {PRODUCT_AREAS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formState === "submitting"
                    ? "Submitting..."
                    : "Submit Feedback"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                {formMessage ? (
                  <p
                    role="status"
                    className="text-sm leading-6 text-muted-foreground"
                  >
                    {formMessage}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Your feedback is used to improve Spendly and its features.
                    This form is not connected yet. Please email{" "}
                    <a
                      href="mailto:amanahamed021@gmail.com"
                      className="text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      amanahamed021@gmail.com
                    </a>{" "}
                    directly.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              What can you help us improve?
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_CARDS.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="glass-panel-strong rounded-3xl p-6 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {card.number}
                    </span>

                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>

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
              Built with feedback. Improved together.
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Spendly is evolving continuously. The best improvements often
              start with a simple suggestion from someone using the product.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Have something on your mind?
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Whether it&apos;s a small suggestion or a big idea, we want to hear
            it.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#feedback-form"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Share Feedback
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <a
              href="mailto:amanahamed021@gmail.com"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
