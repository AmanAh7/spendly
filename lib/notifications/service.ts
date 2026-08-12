import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
};

export async function createNotification(input: CreateNotificationInput) {
  const { userId, type, title, message, link } = input;

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link ?? null,
    },
  });
}

export async function getRecentNotificationsForUser(
  userId: string,
  limit = 10,
) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
