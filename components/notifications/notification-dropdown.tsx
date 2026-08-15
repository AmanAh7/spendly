"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
} from "lucide-react";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notification-actions";

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
  const [isPending, startTransition] = useTransition();
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
    startTransition(async () => {
      if (!notification.readAt) {
        await markNotificationAsRead(notification.id);
      }

      if (notification.link) {
        router.push(notification.link);
      }

      setOpen(false);
      router.refresh();
    });
  }

  function handleMarkAllAsRead() {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      router.refresh();
    });
  }

  function handleViewAll() {
    setOpen(false);
    router.push("/dashboard/notifications");
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
        <div
          className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-border/60 bg-background/95 p-2 text-sm shadow-lg outline-none"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <p className="text-xs font-medium text-muted-foreground">
              Notifications
            </p>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-[11px] text-primary transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                Mark all read
              </button>
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
            <>
              <ul className="max-h-80 space-y-1 overflow-y-auto px-1">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(notification)}
                      disabled={isPending}
                      className={`flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60 ${
                        notification.readAt ? "opacity-70" : "bg-muted/30"
                      }`}
                    >
                      <div className="mt-0.5">{iconFor(notification.type)}</div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {notification.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>

                      {!notification.readAt ? (
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                          aria-label="Unread"
                        />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-2 border-t border-border/60 px-1 pt-2">
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="w-full rounded-lg px-2 py-1.5 text-center text-xs font-medium text-primary transition hover:bg-muted/60"
                >
                  View all notifications
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
