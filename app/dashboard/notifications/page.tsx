import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationHistory } from "@/components/notifications/notification-history";

function formatDate(date: Date) {
  return date.toISOString();
}

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      link: true,
      createdAt: true,
      readAt: true,
    },
  });

  const serialized = notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    createdAt: formatDate(notification.createdAt),
    readAt: notification.readAt ? formatDate(notification.readAt) : null,
  }));

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Activity
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your budget, recurring-expense, and goal updates.
          </p>
        </div>

        <NotificationHistory notifications={serialized} />
      </div>
    </main>
  );
}
