import { createNotification } from "./service";
import { NotificationType } from "@prisma/client";

export async function notifyBudgetApproachingLimit({
  userId,
  budgetName,
  amountSpent,
  budgetAmount,
  percentageUsed,
}: {
  userId: string;
  budgetName: string;
  amountSpent: number | string;
  budgetAmount: number | string;
  percentageUsed: number;
}) {
  const title = `Budget limit approaching: ${budgetName}`;
  const message = `You've used ${percentageUsed.toFixed(0)}% of your "${budgetName}" budget (${amountSpent} / ${budgetAmount}).`;

  return createNotification({
    userId,
    type: NotificationType.BUDGET_APPROACHING_LIMIT,
    title,
    message,
    link: "/dashboard/budgets",
  });
}

export async function notifyBudgetExceeded({
  userId,
  budgetName,
  amountSpent,
  budgetAmount,
}: {
  userId: string;
  budgetName: string;
  amountSpent: number | string;
  budgetAmount: number | string;
}) {
  const title = `Budget exceeded: ${budgetName}`;
  const message = `You've exceeded your "${budgetName}" budget (${amountSpent} / ${budgetAmount}).`;

  return createNotification({
    userId,
    type: NotificationType.BUDGET_EXCEEDED,
    title,
    message,
    link: "/dashboard/budgets",
  });
}

export async function notifyRecurringExpenseUpcoming({
  userId,
  description,
  amount,
  dueDate,
}: {
  userId: string;
  description: string;
  amount: number | string;
  dueDate: Date | string;
}) {
  const title = "Recurring expense due soon";
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const dueStr = due.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const message = `${description} of ${amount} is due on ${dueStr}.`;

  return createNotification({
    userId,
    type: NotificationType.RECURRING_EXPENSE_UPCOMING,
    title,
    message,
    link: "/dashboard/recurring",
  });
}

export async function notifyRecurringExpenseOverdue({
  userId,
  description,
  amount,
  dueDate,
}: {
  userId: string;
  description: string;
  amount: number | string;
  dueDate: Date | string;
}) {
  const title = "Recurring expense overdue";
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const dueStr = due.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const message = `${description} of ${amount} was due on ${dueStr} and hasn't been recorded yet.`;

  return createNotification({
    userId,
    type: NotificationType.RECURRING_EXPENSE_OVERDUE,
    title,
    message,
    link: "/dashboard/recurring",
  });
}

export async function notifyGoalMilestone({
  userId,
  goalName,
  targetAmount,
  currentAmount,
  percentageReached,
}: {
  userId: string;
  goalName: string;
  targetAmount: number | string;
  currentAmount: number | string;
  percentageReached: number;
}) {
  const title = "Goal milestone reached";
  const message = `You've reached ${percentageReached.toFixed(
    0,
  )}% of your "${goalName}" goal (${currentAmount} / ${targetAmount}).`;

  return createNotification({
    userId,
    type: NotificationType.GOAL_MILESTONE,
    title,
    message,
    link: "/dashboard/goals",
  });
}
