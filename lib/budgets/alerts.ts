import { prisma } from "@/lib/prisma";
import {
  notifyBudgetApproachingLimit,
  notifyBudgetExceeded,
} from "@/lib/notifications/alerts";
import { NotificationType } from "@prisma/client";

function getMonthPeriod(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  const periodStart = new Date(Date.UTC(year, month, 1));
  const periodEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return { periodStart, periodEnd };
}

const APPROACHING_THRESHOLD = 0.8;

async function hasBudgetNotificationInPeriod(params: {
  userId: string;
  budgetName: string;
  type: NotificationType;
  periodStart: Date;
  periodEnd: Date;
}) {
  const { userId, budgetName, type, periodStart, periodEnd } = params;

  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      title: {
        startsWith:
          type === NotificationType.BUDGET_APPROACHING_LIMIT
            ? `Budget limit approaching: ${budgetName}`
            : `Budget exceeded: ${budgetName}`,
      },
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  });

  return Boolean(existing);
}

export async function checkAndNotifyBudgetExceeded({
  userId,
  categoryId,
  expenseDate,
}: {
  userId: string;
  categoryId: string | null;
  expenseDate: Date;
}) {
  const { periodStart, periodEnd } = getMonthPeriod(expenseDate);

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      categoryId: categoryId ?? undefined,
      periodStart: {
        lte: expenseDate,
      },
      periodEnd: {
        gte: expenseDate,
      },
    },
  });

  if (budgets.length === 0) {
    return;
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      categoryId: categoryId ?? undefined,
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    select: {
      amount: true,
      categoryId: true,
    },
  });

  for (const budget of budgets) {
    const relevantExpenses = categoryId
      ? expenses.filter((e) => e.categoryId === categoryId)
      : expenses;

    const totalSpent = relevantExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const budgetAmount = Number(budget.amount);

    if (budgetAmount <= 0) {
      continue;
    }

    const usageRatio = totalSpent / budgetAmount;

    // Approaching limit: 80–99%
    if (usageRatio >= APPROACHING_THRESHOLD && usageRatio < 1) {
      const alreadyApproaching = await hasBudgetNotificationInPeriod({
        userId,
        budgetName: budget.name,
        type: NotificationType.BUDGET_APPROACHING_LIMIT,
        periodStart,
        periodEnd,
      });

      if (!alreadyApproaching) {
        const percentageUsed = usageRatio * 100;

        await notifyBudgetApproachingLimit({
          userId,
          budgetName: budget.name,
          amountSpent: totalSpent.toFixed(2),
          budgetAmount: budgetAmount.toFixed(2),
          percentageUsed,
        });
      }
    }

    // Exceeded limit: > 100%
    if (totalSpent > budgetAmount) {
      const alreadyExceeded = await hasBudgetNotificationInPeriod({
        userId,
        budgetName: budget.name,
        type: NotificationType.BUDGET_EXCEEDED,
        periodStart,
        periodEnd,
      });

      if (!alreadyExceeded) {
        await notifyBudgetExceeded({
          userId,
          budgetName: budget.name,
          amountSpent: totalSpent.toFixed(2),
          budgetAmount: budgetAmount.toFixed(2),
        });
      }
    }
  }
}
