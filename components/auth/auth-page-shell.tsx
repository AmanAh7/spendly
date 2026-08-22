"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-black text-white">
      {!prefersReducedMotion ? (
        <video
          className="pointer-events-none fixed inset-0 z-0 h-screen w-screen object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/videos/login-page-looped.mp4" type="video/mp4" />
        </video>
      ) : null}

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-black/35"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-linear-to-r from-black/25 via-black/15 to-black/40"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen justify-end">
        <section className="flex min-h-screen w-full items-center justify-center px-5 py-8 sm:px-8 md:w-[48%] lg:w-[40%] xl:w-[30%] lg:px-10 lg:py-12">
          {!prefersReducedMotion ? (
            <video
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35 lg:hidden"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
            >
              <source src="/videos/login-page-looped.mp4" type="video/mp4" />
            </video>
          ) : null}

          <div
            className="pointer-events-none absolute inset-0 bg-black/55 lg:hidden"
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-md lg:max-w-none">
            <div className="glass-panel-strong rounded-3xl border border-white/12 bg-[rgba(20,24,40,0.56)] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
              <div className="mb-6 flex justify-end">
                <Link
                  href="/"
                  className="rounded-lg px-2 py-1 text-xs font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Back to Spendly
                </Link>
              </div>

              <div className="text-white">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
