"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { isNavigationItemActive, navigationGroups } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.aside
      initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border/60 bg-sidebar/55 px-4 py-5 backdrop-blur-2xl lg:flex",
        className,
      )}
    >
      <Link
        href="/dashboard"
        className="group rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <p className="text-lg font-semibold tracking-tight text-sidebar-foreground transition-colors group-hover:text-sidebar-primary">
          Spendly
        </p>

        <p className="mt-1 text-xs text-sidebar-foreground/55">
          Take control of your money.
        </p>
      </Link>

      <nav
        aria-label="Dashboard navigation"
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
                  const active = isNavigationItemActive(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/65 transition-colors duration-200 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        active && "bg-sidebar-accent text-sidebar-foreground",
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="sidebar-active-indicator"
                          transition={{
                            duration: 0.2,
                            ease: "easeOut",
                          }}
                          className="absolute left-0 h-5 w-0.5 rounded-full bg-sidebar-primary"
                        />
                      ) : null}

                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/80",
                        )}
                        aria-hidden="true"
                      />

                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="mt-6 border-t border-sidebar-border/60 px-3 pt-4">
        <p className="truncate text-xs text-sidebar-foreground/45">
          Personal finance
        </p>

        <p className="mt-1 truncate text-sm font-medium text-sidebar-foreground/80">
          Your workspace
        </p>

        <SignOutButton className="mt-3" />
      </div>
    </motion.aside>
  );
}
