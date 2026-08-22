"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  LockKeyhole,
  Menu,
  WalletCards,
  X,
} from "lucide-react";

const BENEFITS = [
  {
    icon: CircleDollarSign,
    title: "See the full picture",
    description:
      "Bring income, spending, budgets, and goals into one focused view.",
  },
  {
    icon: BarChart3,
    title: "Make clearer decisions",
    description:
      "Turn everyday transactions into useful patterns you can act on.",
  },
  {
    icon: LockKeyhole,
    title: "Keep control private",
    description:
      "Your financial workspace is organized around your authenticated account.",
  },
];

const PREVIEW_ROWS = [
  {
    label: "Monthly spending",
    value: "₹24,680",
    change: "12.4%",
    tone: "text-success",
    width: "68%",
  },
  {
    label: "Savings progress",
    value: "₹84,500",
    change: "64%",
    tone: "text-primary",
    width: "64%",
  },
  {
    label: "Budget remaining",
    value: "₹18,320",
    change: "Healthy",
    tone: "text-success",
    width: "46%",
  },
];

const INTRO_DURATION_MS = 3200;

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [motionPreferenceReady, setMotionPreferenceReady] = useState(false);
  const [introProgress, setIntroProgress] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [navbarProgress, setNavbarProgress] = useState(0);
  const initialMotionPreference = useRef<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    initialMotionPreference.current = mediaQuery.matches;
    setPrefersReducedMotion(mediaQuery.matches);
    setMotionPreferenceReady(true);

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);
  useEffect(() => {
    if (!introDismissed) {
      return;
    }

    let frameId = 0;

    const updateNavbar = () => {
      window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        const scrollDistance = Math.max(window.innerHeight * 0.5, 1);
        const nextProgress = Math.min(window.scrollY / scrollDistance, 1);

        setNavbarProgress(nextProgress);
      });
    };

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    window.addEventListener("resize", updateNavbar);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateNavbar);
      window.removeEventListener("resize", updateNavbar);
    };
  }, [introDismissed]);
  useEffect(() => {
    if (!motionPreferenceReady) {
      return;
    }

    if (initialMotionPreference.current) {
      setIntroProgress(100);
      setIntroComplete(true);
      return;
    }

    let frameId = 0;
    let startTime: number | null = null;

    const updateProgress = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const nextProgress = Math.min(
        100,
        Math.round((elapsed / INTRO_DURATION_MS) * 100),
      );

      setIntroProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = window.requestAnimationFrame(updateProgress);
        return;
      }

      setIntroComplete(true);
    };

    frameId = window.requestAnimationFrame(updateProgress);

    return () => window.cancelAnimationFrame(frameId);
  }, [motionPreferenceReady]);

  function closeMobileMenu() {
    setIsMenuOpen(false);
  }

  if (!introDismissed) {
    return (
      <main className="fixed inset-0 z-50 overflow-hidden bg-black text-white">
        {!prefersReducedMotion ? (
          <video
            key="intro-landing-video"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/videos/intro-landing.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            className="pointer-events-none absolute inset-0 bg-black"
            aria-hidden="true"
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-black/25"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/35 via-black/10 to-black/45"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-radial-[at_50%_45%] from-transparent via-black/5 to-black/35"
          aria-hidden="true"
        />

        <div className="relative flex min-h-dvh flex-col overflow-hidden px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 sm:pb-8 sm:pt-8 lg:px-12 lg:pb-10 lg:pt-10">
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="flex w-full max-w-5xl flex-col items-center text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-xs">
                Calibrating your financial view
              </p>

              <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.06em] text-white sm:mt-6 sm:text-6xl lg:text-7xl xl:text-8xl">
                See your money more clearly...
              </h1>

              <div
                role="status"
                aria-live="polite"
                aria-label={
                  introComplete
                    ? "Calibration complete. Begin is ready."
                    : `Calibrating your financial view: ${introProgress}% complete`
                }
                className="mt-10 w-full max-w-xs sm:mt-12 sm:max-w-md"
              >
                {introComplete ? (
                  <button
                    type="button"
                    onClick={() => setIntroDismissed(true)}
                    className="w-full border border-white/55 bg-white/10 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:py-4"
                  >
                    Begin
                  </button>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                      <span>Preparing Spendly</span>
                      <span>{introProgress}%</span>
                    </div>

                    <div
                      className="mt-3 h-px w-full overflow-hidden bg-white/25"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full bg-primary transition-[width] duration-75 ease-linear"
                        style={{ width: `${introProgress}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white/55 sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <p>Welcome to Spendly</p>
            <p className="hidden sm:block">
              {introComplete
                ? "Calibration complete"
                : "Loading your workspace"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {!prefersReducedMotion ? (
        <video
          key="spendly-hero-video"
          className="pointer-events-none fixed inset-0 z-0 h-screen w-screen object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/videos/spendly-hero.mp4"
          aria-hidden="true"
        >
          <source src="/videos/spendly-hero.mp4" type="video/mp4" />
        </video>
      ) : null}

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-black/15 dark:bg-black/20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-linear-to-r from-black/30 via-black/10 to-transparent dark:from-black/40 dark:via-black/15 dark:to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-1/2 bg-linear-to-t from-background via-background/75 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <nav
          aria-label="Main navigation"
          className="fixed z-40 flex items-center justify-between border border-white/10 bg-black/20 px-3 py-2 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:px-4"
          style={
            prefersReducedMotion
              ? undefined
              : {
                  left: `${50 * (1 - navbarProgress)}%`,
                  top: `${12 * (1 - navbarProgress)}px`,
                  width: `calc(100% - ${24 * (1 - navbarProgress)}px)`,
                  maxWidth: `${1024 + (window.innerWidth - 1024) * navbarProgress}px`,
                  borderRadius: `${9999 * (1 - navbarProgress)}px`,
                  transform:
                    navbarProgress < 1
                      ? `translateX(-${50 * (1 - navbarProgress)}%)`
                      : undefined,
                }
          }
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg text-sm font-semibold tracking-tight text-white outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Spendly home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <WalletCards className="h-4 w-4" aria-hidden="true" />
            </span>
            Spendly
          </Link>

          <div className="hidden items-center gap-7 sm:flex">
            <a
              href="#product"
              className="text-sm text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Product
            </a>
            <a
              href="#why-spendly"
              className="text-sm text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Why Spendly
            </a>
            <Link
              href="/login"
              className="rounded-full border border-white/30 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get started
            </Link>
          </div>

          <div className="relative flex items-center gap-2 sm:hidden">
            <button
              type="button"
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="rounded-lg border border-white/25 bg-black/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <AnimatePresence>
              {isMenuOpen ? (
                <motion.div
                  id="mobile-navigation-menu"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="glass-panel-strong absolute right-0 top-12 w-56 rounded-2xl p-2"
                >
                  <a
                    href="#product"
                    onClick={closeMobileMenu}
                    className="block rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Product
                  </a>
                  <a
                    href="#why-spendly"
                    onClick={closeMobileMenu}
                    className="block rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Why Spendly
                  </a>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="block rounded-xl border border-white/25 bg-white/5 px-3 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="mt-1 block rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Get started
                  </Link>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </nav>

        <section className="mx-auto flex min-h-180 w-full max-w-7xl items-center px-5 pb-24 pt-32 sm:px-8 sm:pb-32 sm:pt-36 lg:px-10 lg:pt-40">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-2xl rounded-3xl bg-black/30 p-6 text-white shadow-2xl shadow-black/10 sm:p-8"
          >
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              Know where your money is going.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Spendly gives your finances a clear place to land, so you can
              spend intentionally, plan ahead, and make progress without the
              noise.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Get started free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sign in to Spendly
              </Link>
            </div>
          </motion.div>
        </section>

        <section
          id="product"
          className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div className="max-w-md">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                One focused view
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Less noise. Better decisions.
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                Keep the important signals close: what came in, what went out,
                what you are planning, and how your goals are moving.
              </p>
            </div>

            <div
              className="glass-panel-strong rounded-3xl p-4 sm:p-6"
              aria-label="Static preview of the Spendly dashboard"
              role="img"
            >
              <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-border/60 bg-background/35 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Available balance
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        ₹1,24,860
                      </p>
                    </div>
                    <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-medium text-success">
                      +8.6%
                    </span>
                  </div>

                  <div className="mt-8 flex h-24 items-end gap-1.5">
                    {[34, 46, 40, 58, 52, 72, 66, 84, 76, 92, 82, 100].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md bg-primary/20"
                          style={{ height: `${height}%` }}
                        >
                          <div
                            className="h-full rounded-t-md bg-primary/70"
                            style={{
                              transform: `scaleY(${index === 11 ? 1 : 0.6})`,
                              transformOrigin: "bottom",
                            }}
                          />
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                    <span>Jan</span>
                    <span>Jun</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        This month
                      </p>
                      <BarChart3
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-3 text-xl font-semibold text-foreground">
                      ₹38,240
                    </p>
                    <p className="mt-1 text-xs text-success">
                      14% less than last month
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Savings goal
                      </p>
                      <span className="text-xs font-medium text-primary">
                        68%
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/70">
                      <div className="h-full w-[68%] rounded-full bg-primary" />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                      <span>₹84,500 saved</span>
                      <span>₹1,24,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 border-t border-border/60 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground">
                    Recent activity
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    View all
                  </span>
                </div>

                <div className="space-y-3">
                  {PREVIEW_ROWS.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-3 text-xs"
                    >
                      <div className="h-7 w-7 rounded-lg bg-muted/70" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <span className="truncate text-muted-foreground">
                            {row.label}
                          </span>
                          <span className={`shrink-0 ${row.tone}`}>
                            {row.change}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted/70">
                          <div
                            className="h-full rounded-full bg-primary/70"
                            style={{ width: row.width }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 font-medium text-foreground">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="why-spendly"
          className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28"
        >
          <div className="grid gap-4 border-t border-border/60 pt-8 sm:grid-cols-3 sm:gap-6">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div key={benefit.title} className="max-w-sm">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-4 text-sm font-medium text-foreground">
                    {benefit.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          <div className="glass-panel-strong flex flex-col items-start justify-between gap-6 rounded-3xl p-6 sm:p-8 md:flex-row md:items-center">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Start with clarity
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Give your money a better system.
              </h2>
            </div>

            <Link
              href="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Create your account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <footer className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 border-t border-border/60 px-5 py-6 text-center text-xs text-muted-foreground sm:px-8 lg:px-10">
          <p>Copyright © 2026 Aman. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
