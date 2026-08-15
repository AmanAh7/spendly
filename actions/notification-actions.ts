"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type NotificationActionResult = {
  error?: string;
  success?: string;
};

async function getAuthenticatedUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<NotificationActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!notificationId) {
      return { error: "Notification not found." };
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      return { error: "Notification not found." };
    }

    await prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notifications");

    return {
      success: "Notification marked as read.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Mark notification as read error:", error);

    return {
      error: "Unable to update the notification.",
    };
  }
}

export async function markAllNotificationsAsRead(): Promise<NotificationActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notifications");

    return {
      success: "All notifications marked as read.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Mark all notifications as read error:", error);

    return {
      error: "Unable to update notifications.",
    };
  }
}
