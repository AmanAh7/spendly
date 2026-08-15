import { NotificationType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  notifyRecurringExpenseOverdue,
  notifyRecurringExpenseUpcoming,
} from "@/lib/notifications/alerts";

type RecurringFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

const UPCOMING_WINDOW_DAYS = 3;

function todayUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function addDays(date: Date, days: number) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );
}

function isDateOnOrBefore(first: Date, second: Date) {
  return first.getTime() <= second.getTime();
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addRecurringInterval(
  date: Date,
  frequency: RecurringFrequency,
  anchorDay: number | null,
) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  if (frequency === "WEEKLY") {
    return new Date(Date.UTC(year, month, day + 7));
  }

  if (frequency === "MONTHLY") {
    const unwrappedMonth = month + 1;
    const nextYear = year + Math.floor(unwrappedMonth / 12);
    const nextMonth = unwrappedMonth % 12;
    const recurrenceDay = anchorDay ?? day;
    const targetDay = Math.min(
      recurrenceDay,
      lastDayOfMonth(nextYear, nextMonth),
    );

    return new Date(Date.UTC(nextYear, nextMonth, targetDay));
  }

  const nextYear = year + 1;
  const recurrenceDay = anchorDay ?? day;
  const targetDay = Math.min(recurrenceDay, lastDayOfMonth(nextYear, month));

  return new Date(Date.UTC(nextYear, month, targetDay));
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function hasRecurringNotification(params: {
  userId: string;
  recurringExpenseId: string;
  type: NotificationType;
  dueDate: Date;
}) {
  const { userId, recurringExpenseId, type, dueDate } = params;

  const link = `/dashboard/recurring?recurringExpenseId=${recurringExpenseId}`;

  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      link,
      message: {
        contains: dueDate.toISOString().slice(0, 10),
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(existing);
}

async function processRecurringExpenseNotifications() {
  const today = todayUtc();
  const upcomingEndDate = addDays(today, UPCOMING_WINDOW_DAYS);

  const [upcomingRecurringExpenses, overdueManualRecurringExpenses] =
    await Promise.all([
      prisma.recurringExpense.findMany({
        where: {
          isActive: true,
          nextDueDate: {
            gte: today,
            lte: upcomingEndDate,
          },
        },
        select: {
          id: true,
          userId: true,
          description: true,
          amount: true,
          nextDueDate: true,
        },
      }),
      prisma.recurringExpense.findMany({
        where: {
          isActive: true,
          generationMode: "MANUAL",
          nextDueDate: {
            lt: today,
          },
        },
        select: {
          id: true,
          userId: true,
          description: true,
          amount: true,
          nextDueDate: true,
        },
      }),
    ]);

  let upcomingNotificationCount = 0;
  let overdueNotificationCount = 0;

  for (const recurring of upcomingRecurringExpenses) {
    const alreadyNotified = await hasRecurringNotification({
      userId: recurring.userId,
      recurringExpenseId: recurring.id,
      type: NotificationType.RECURRING_EXPENSE_UPCOMING,
      dueDate: recurring.nextDueDate,
    });

    if (alreadyNotified) {
      continue;
    }

    await notifyRecurringExpenseUpcoming({
      userId: recurring.userId,
      recurringExpenseId: recurring.id,
      description: recurring.description,
      amount: recurring.amount.toString(),
      dueDate: recurring.nextDueDate,
    });

    upcomingNotificationCount += 1;
  }

  for (const recurring of overdueManualRecurringExpenses) {
    const alreadyNotified = await hasRecurringNotification({
      userId: recurring.userId,
      recurringExpenseId: recurring.id,
      type: NotificationType.RECURRING_EXPENSE_OVERDUE,
      dueDate: recurring.nextDueDate,
    });

    if (alreadyNotified) {
      continue;
    }

    await notifyRecurringExpenseOverdue({
      userId: recurring.userId,
      recurringExpenseId: recurring.id,
      description: recurring.description,
      amount: recurring.amount.toString(),
      dueDate: recurring.nextDueDate,
    });

    overdueNotificationCount += 1;
  }

  return {
    upcomingNotificationCount,
    overdueNotificationCount,
  };
}

export async function processDueAutomaticRecurringExpenses() {
  const today = todayUtc();

  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: {
      isActive: true,
      generationMode: "AUTOMATIC",
      nextDueDate: {
        lte: today,
      },
    },
    orderBy: {
      nextDueDate: "asc",
    },
  });

  let generatedCount = 0;
  let processedOccurrenceCount = 0;

  for (const recurring of recurringExpenses) {
    let dueDate = recurring.nextDueDate;
    let anchorDay: number | null = null;
    let safetyCounter = 0;

    while (isDateOnOrBefore(dueDate, today) && safetyCounter < 240) {
      const nextDueDate = addRecurringInterval(
        dueDate,
        recurring.frequency,
        anchorDay,
      );

      try {
        await prisma.$transaction(async (transaction) => {
          const expense = await transaction.expense.create({
            data: {
              userId: recurring.userId,
              categoryId: recurring.categoryId,
              amount: recurring.amount,
              description: recurring.description,
              paymentMethod: recurring.paymentMethod,
              date: dueDate,
              notes: recurring.notes
                ? `${recurring.notes}\nAutomatically generated from recurring expense.`
                : "Automatically generated from recurring expense.",
            },
          });

          await transaction.recurringExpenseOccurrence.create({
            data: {
              recurringExpenseId: recurring.id,
              expenseId: expense.id,
              dueDate,
            },
          });

          await transaction.recurringExpense.updateMany({
            where: {
              id: recurring.id,
              userId: recurring.userId,
              isActive: true,
              generationMode: "AUTOMATIC",
              nextDueDate: dueDate,
            },
            data: {
              nextDueDate,
            },
          });
        });

        generatedCount += 1;
        processedOccurrenceCount += 1;
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          throw error;
        }

        await prisma.recurringExpense.updateMany({
          where: {
            id: recurring.id,
            userId: recurring.userId,
            isActive: true,
            generationMode: "AUTOMATIC",
            nextDueDate: dueDate,
          },
          data: {
            nextDueDate,
          },
        });

        processedOccurrenceCount += 1;
      }

      anchorDay ??= dueDate.getUTCDate();
      dueDate = nextDueDate;
      safetyCounter += 1;
    }
  }

  const notificationResult = await processRecurringExpenseNotifications();

  return {
    generatedCount,
    processedOccurrenceCount,
    recurringExpenseCount: recurringExpenses.length,
    ...notificationResult,
  };
}
