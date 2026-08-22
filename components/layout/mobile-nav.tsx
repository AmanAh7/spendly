"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { isNavigationItemActive, navigationGroups } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 cursor-default bg-black/55 backdrop-blur-[2px] lg:hidden"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={shouldReduceMotion ? false : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(19rem,86vw)] flex-col border-r border-sidebar-border/70 bg-sidebar px-4 py-5 shadow-2xl lg:hidden"
          >
            <div className="flex items-start justify-between gap-4">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <p className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                  Spendly
                </p>

                <p className="mt-1 text-xs text-sidebar-foreground/55">
                  Take control of your money.
                </p>
              </Link>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <nav
              aria-label="Mobile dashboard navigation"
              className="mt-8 flex-1 overflow-y-auto"
            >
              <div className="space-y-7">
                {navigationGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
                      {group.label}
                    </p>

                    <div className="mt-2 space-y-1">
                      {group.items.map((item) => {
                        const active = isNavigationItemActive(
                          pathname,
                          item.href,
                        );
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                              active &&
                                "bg-sidebar-accent text-sidebar-foreground",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4",
                                active
                                  ? "text-sidebar-primary"
                                  : "text-sidebar-foreground/50",
                              )}
                              aria-hidden="true"
                            />

                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            <div className="mt-6 border-t border-sidebar-border/60 px-3 pt-4">
              <SignOutButton />
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
