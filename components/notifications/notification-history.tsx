"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCheck,
  CheckCircle2,
  Circle,
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

type FilterValue = "all" | "unread" | "read";

type NotificationHistoryProps = {
  notifications: NotificationItem[];
};

function formatNotificationDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function NotificationHistory({
  notifications,
}: NotificationHistoryProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt,
  ).length;

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.readAt);
    }

    if (filter === "read") {
      return notifications.filter((notification) => notification.readAt);
    }

    return notifications;
  }, [filter, notifications]);

  function iconFor(type: string) {
    if (type === "BUDGET_EXCEEDED" || type === "RECURRING_EXPENSE_OVERDUE") {
      return <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />;
    }

    if (
      type === "BUDGET_APPROACHING_LIMIT" ||
      type === "RECURRING_EXPENSE_UPCOMING"
    ) {
      return <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden />;
    }

    if (type === "GOAL_MILESTONE") {
      return <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden />;
    }

    return <Info className="h-5 w-5 text-muted-foreground" aria-hidden />;
  }

  function handleNotificationClick(notification: NotificationItem) {
    startTransition(async () => {
      if (!notification.readAt) {
        await markNotificationAsRead(notification.id);
      }

      if (notification.link) {
        router.push(notification.link);
        return;
      }

      router.refresh();
    });
  }

  function handleMarkAllAsRead() {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Notification history</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You’re all caught up."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border/60 bg-background/50 p-1">
            {(["all", "unread", "read"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition ${
                  filter === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCheck className="h-4 w-4" aria-hidden />
              Mark all read
            </button>
          ) : null}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <Info className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm font-medium">No notifications found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try another filter or check back later.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {filteredNotifications.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => handleNotificationClick(notification)}
                disabled={isPending}
                className={`flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60 ${
                  notification.readAt ? "" : "bg-primary/3"
                }`}
              >
                <div className="mt-0.5 rounded-full border border-border/60 bg-background p-2">
                  {iconFor(notification.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{notification.title}</p>

                    {!notification.readAt ? (
                      <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-primary">
                        <Circle className="h-2 w-2 fill-current" aria-hidden />
                        Unread
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatNotificationDate(notification.createdAt)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
