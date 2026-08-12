"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, Info, AlertTriangle } from "lucide-react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  readAt: string | null;
};

type NotificationDropdownProps = {
  notifications: NotificationItem[];
};

export function NotificationDropdown({
  notifications,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  function iconFor(type: string) {
    if (type === "BUDGET_EXCEEDED" || type === "RECURRING_EXPENSE_OVERDUE") {
      return <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />;
    }

    if (
      type === "BUDGET_APPROACHING_LIMIT" ||
      type === "RECURRING_EXPENSE_UPCOMING"
    ) {
      return <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden />;
    }

    if (type === "GOAL_MILESTONE") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />;
    }

    return <Info className="h-4 w-4 text-muted-foreground" aria-hidden />;
  }

  function handleClick(notification: NotificationItem) {
    if (notification.link) {
      router.push(notification.link);
      setOpen(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground shadow-sm transition hover:border-primary hover:text-primary"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-border/60 bg-background/95 p-2 text-sm shadow-lg outline-none">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-xs font-medium text-muted-foreground">
              Notifications
            </p>
            {unreadCount > 0 ? (
              <span className="text-[11px] text-primary">
                {unreadCount} unread
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                You&apos;re all caught up
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-3 py-4 text-xs text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto px-1">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-muted/60"
                  >
                    <div className="mt-0.5">{iconFor(n.type)}</div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {n.message}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
