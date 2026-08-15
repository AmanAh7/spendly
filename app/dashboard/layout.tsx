import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
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

  const serialized = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt ? n.readAt.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-background">
      <header className="border-b border-border/60 bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium text-primary">Spendly</p>
            <p className="text-sm text-muted-foreground">
              Take control of your money.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/settings"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sr-only sm:hidden">Settings</span>
            </Link>

            <NotificationDropdown notifications={serialized} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
