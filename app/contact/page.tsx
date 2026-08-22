"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Lightbulb,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

const CONTACT_EMAIL = "amanahamed021@gmail.com";

const FAQ_ITEMS = [
  {
    question: "How do I get started with Spendly?",
    answer:
      "Simply create an account and you can start tracking your income, expenses, budgets, and goals in one focused view.",
  },
  {
    question: "Is my financial information private?",
    answer:
      "Yes. Your data is tied to your authenticated account and is kept private. Spendly is designed around your personal financial workspace.",
  },
  {
    question: "I found a problem. How can I report it?",
    answer: `Email us at ${CONTACT_EMAIL} with details about the issue and we’ll look into it.`,
  },
  {
    question: "Can I suggest a new feature?",
    answer: `Absolutely. We welcome ideas that could make Spendly better. Send your suggestions to ${CONTACT_EMAIL}.`,
  },
];

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `faq-panel-${index}`;

  return (
    <div className="border-b border-border/60">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="text-sm font-medium text-foreground">{question}</span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div id={panelId} hidden={!isOpen} className="pb-4">
        <p className="text-sm leading-6 text-muted-foreground">{answer}</p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [formState, setFormState] = useState<"idle" | "submitting">("idle");
  const [formMessage, setFormMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formState === "submitting") {
      return;
    }

    setFormState("submitting");
    setFormMessage(
      `This form is not connected yet. Please email ${CONTACT_EMAIL} directly.`,
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
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              CONTACT SPENDLY
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Let&apos;s talk about your money journey.
            </h1>

            <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
              Have a question about Spendly, need help with your account, or
              simply want to share some feedback? We&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-background/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Get in touch
              </h2>

              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Have something to tell us? Fill out the form and our team will
                get back to you as soon as possible.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-3">
                  <Mail
                    className="mt-1 h-5 w-5 text-primary"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>

                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-sm text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle
                    className="mt-1 h-5 w-5 text-primary"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Support
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Need help using Spendly? Our support team is here to
                      assist.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lightbulb
                    className="mt-1 h-5 w-5 text-primary"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Feedback
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Have an idea that could make Spendly better? We&apos;d
                      love to hear it.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel-strong rounded-3xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Name
                  </label>

                  <input
                    id="contact-name"
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
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>

                  <input
                    id="contact-email"
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
                    htmlFor="contact-subject"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Subject
                  </label>

                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="What can we help you with?"
                    disabled={formState === "submitting"}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Message
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Tell us how we can help..."
                    disabled={formState === "submitting"}
                    className="w-full resize-y rounded-xl border border-input bg-background/40 px-3 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formState === "submitting" ? "Sending..." : "Send Message"}
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
                    This form is not yet connected to a backend. No messages are
                    sent at this time. Please email{" "}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {CONTACT_EMAIL}
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
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Frequently asked questions
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Quick answers to common questions.
            </p>

            <div className="mt-8">
              {FAQ_ITEMS.map((item, index) => (
                <FAQItem key={item.question} index={index} {...item} />
              ))}
            </div>
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

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Have a question? Let&apos;s figure it out.
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Your feedback helps us make Spendly better.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Spendly%20Support%20Request&body=Hello%20Spendly%20support%2C%0A%0AI%20need%20help%20with%3A%20`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Back to Spendly
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
