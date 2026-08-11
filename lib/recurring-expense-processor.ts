import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type RecurringFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

function todayUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
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

        /*
         * Another cron invocation already created this occurrence.
         * Advance only if the recurring record still points at this
         * due date. This cannot move a newer nextDueDate backwards.
         */
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

      /*
       * The original day is retained across short months:
       *
       * January 31 -> February 28 -> March 31
       * February 29 -> February 28 in a non-leap year
       */
      anchorDay ??= dueDate.getUTCDate();
      dueDate = nextDueDate;
      safetyCounter += 1;
    }
  }

  return {
    generatedCount,
    processedOccurrenceCount,
    recurringExpenseCount: recurringExpenses.length,
  };
}
