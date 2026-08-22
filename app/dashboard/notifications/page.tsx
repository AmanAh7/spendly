import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationHistory } from "@/components/notifications/notification-history";
import { PageHeader } from "@/components/layout/page-header";

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
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          eyebrow="Activity"
          title="Notifications"
          description="Review your budget, recurring-expense, and goal updates."
        />

        <NotificationHistory notifications={serialized} />
      </div>
    </main>
  );
}
