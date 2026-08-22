"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { cn } from "@/lib/utils";

export type SerializedNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  readAt: string | null;
};

type TopbarProps = {
  notifications: SerializedNotification[];
  onMenuClick: () => void;
};

export function Topbar({ notifications, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          <Link
            href="/dashboard"
            className={cn(
              "truncate text-sm font-medium tracking-tight text-foreground/80 lg:hidden",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            Spendly
          </Link>

          <p className="hidden text-sm text-muted-foreground lg:block">
            Personal finance workspace
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NotificationDropdown notifications={notifications} />
        </div>
      </div>
    </header>
  );
}
