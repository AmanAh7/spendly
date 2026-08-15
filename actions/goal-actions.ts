"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  contributionSchema,
  goalSchema,
  type ContributionInput,
  type GoalInput,
} from "@/lib/validators/goal";

export type GoalActionResult = {
  error?: string;
  success?: string;
};

const GOAL_MILESTONES = [25, 50, 75, 100] as const;

async function getAuthenticatedUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

function toUtcDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function validationError(
  result:
    | ReturnType<typeof goalSchema.safeParse>
    | ReturnType<typeof contributionSchema.safeParse>,
) {
  if (result.success) {
    return undefined;
  }

  return result.error.issues[0]?.message ?? "Please check the form details.";
}

async function validateCategoryOwnership(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      appliesToGoals: true,
    },
    select: {
      id: true,
    },
  });

  return Boolean(category);
}

function calculateGoalProgress(
  savedAmount: Prisma.Decimal,
  targetAmount: Prisma.Decimal,
) {
  if (targetAmount.lessThanOrEqualTo(0)) {
    return 0;
  }

  return savedAmount
    .dividedBy(targetAmount)
    .times(100)
    .toDecimalPlaces(2)
    .toNumber();
}

function milestoneMessage(goalName: string, milestone: number) {
  if (milestone === 100) {
    return `Congratulations! You completed "${goalName}" (100%). [Milestone: 100%]`;
  }

  return `You reached ${milestone}% of your "${goalName}" goal. [Milestone: ${milestone}%]`;
}

async function createGoalMilestoneNotifications(params: {
  userId: string;
  goalId: string;
  goalName: string;
  previousProgress: number;
  currentProgress: number;
}) {
  const { userId, goalId, goalName, previousProgress, currentProgress } =
    params;

  const link = `/dashboard/goals?goalId=${goalId}`;

  const crossedMilestones = GOAL_MILESTONES.filter(
    (milestone) => previousProgress < milestone && currentProgress >= milestone,
  );

  for (const milestone of crossedMilestones) {
    const marker = `[Milestone: ${milestone}%]`;

    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId,
        type: "GOAL_MILESTONE",
        link,
        message: {
          contains: marker,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingNotification) {
      continue;
    }

    await prisma.notification.create({
      data: {
        userId,
        type: "GOAL_MILESTONE",
        title:
          milestone === 100
            ? "Goal completed!"
            : `Goal milestone: ${milestone}%`,
        message: milestoneMessage(goalName, milestone),
        link,
      },
    });
  }
}

async function updateGoalCompletion(goalId: string) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: {
      targetAmount: true,
      contributions: {
        select: {
          amount: true,
        },
      },
    },
  });

  if (!goal) {
    return;
  }

  const savedAmount = goal.contributions.reduce(
    (total, contribution) => total.add(new Prisma.Decimal(contribution.amount)),
    new Prisma.Decimal(0),
  );

  const completedAt = savedAmount.greaterThanOrEqualTo(goal.targetAmount)
    ? new Date()
    : null;

  await prisma.goal.update({
    where: { id: goalId },
    data: { completedAt },
  });
}

export async function createGoal(input: GoalInput): Promise<GoalActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    const parsed = goalSchema.safeParse(input);

    if (!parsed.success) {
      return { error: validationError(parsed) };
    }

    const categoryId = parsed.data.categoryId || null;

    if (categoryId && !(await validateCategoryOwnership(userId, categoryId))) {
      return { error: "The selected category is invalid." };
    }

    await prisma.goal.create({
      data: {
        userId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        targetAmount: new Prisma.Decimal(parsed.data.targetAmount),
        categoryId,
        targetDate: parsed.data.targetDate
          ? toUtcDate(parsed.data.targetDate)
          : null,
        completedAt: null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/goals");

    return {
      success: "Goal created successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Create goal error:", error);

    return {
      error: "Unable to create the goal. Please try again.",
    };
  }
}

export async function updateGoal(
  id: string,
  input: GoalInput,
): Promise<GoalActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return { error: "Goal not found." };
    }

    const parsed = goalSchema.safeParse(input);

    if (!parsed.success) {
      return { error: validationError(parsed) };
    }

    const categoryId = parsed.data.categoryId || null;

    if (categoryId && !(await validateCategoryOwnership(userId, categoryId))) {
      return { error: "The selected category is invalid." };
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingGoal) {
      return { error: "Goal not found." };
    }

    await prisma.goal.update({
      where: {
        id: existingGoal.id,
      },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        targetAmount: new Prisma.Decimal(parsed.data.targetAmount),
        categoryId,
        targetDate: parsed.data.targetDate
          ? toUtcDate(parsed.data.targetDate)
          : null,
      },
    });

    await updateGoalCompletion(existingGoal.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/goals");

    return {
      success: "Goal updated successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Update goal error:", error);

    return {
      error: "Unable to update the goal. Please try again.",
    };
  }
}

export async function deleteGoal(id: string): Promise<GoalActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!id) {
      return { error: "Goal not found." };
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingGoal) {
      return { error: "Goal not found." };
    }

    await prisma.goal.delete({
      where: {
        id: existingGoal.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/goals");

    return {
      success: "Goal deleted successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Delete goal error:", error);

    return {
      error: "Unable to delete the goal. Please try again.",
    };
  }
}

export async function createGoalContribution(
  goalId: string,
  input: ContributionInput,
): Promise<GoalActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!goalId) {
      return { error: "Goal not found." };
    }

    const parsed = contributionSchema.safeParse(input);

    if (!parsed.success) {
      return { error: validationError(parsed) };
    }

    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
      select: {
        id: true,
        name: true,
        targetAmount: true,
        contributions: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!goal) {
      return { error: "Goal not found." };
    }

    const previousSavedAmount = goal.contributions.reduce(
      (total, contribution) =>
        total.add(new Prisma.Decimal(contribution.amount)),
      new Prisma.Decimal(0),
    );

    const contributionAmount = new Prisma.Decimal(parsed.data.amount);
    const previousProgress = calculateGoalProgress(
      previousSavedAmount,
      goal.targetAmount,
    );
    const currentProgress = calculateGoalProgress(
      previousSavedAmount.add(contributionAmount),
      goal.targetAmount,
    );

    await prisma.goalContribution.create({
      data: {
        userId,
        goalId: goal.id,
        amount: contributionAmount,
        date: toUtcDate(parsed.data.date),
        note: parsed.data.note || null,
      },
    });

    await updateGoalCompletion(goal.id);

    await createGoalMilestoneNotifications({
      userId,
      goalId: goal.id,
      goalName: goal.name,
      previousProgress,
      currentProgress,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/goals");

    return {
      success: "Contribution added successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Create goal contribution error:", error);

    return {
      error: "Unable to add the contribution. Please try again.",
    };
  }
}

export async function deleteGoalContribution(
  goalId: string,
  contributionId: string,
): Promise<GoalActionResult> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!goalId || !contributionId) {
      return { error: "Contribution not found." };
    }

    const contribution = await prisma.goalContribution.findFirst({
      where: {
        id: contributionId,
        goalId,
        userId,
        goal: {
          userId,
        },
      },
      select: {
        id: true,
        goalId: true,
      },
    });

    if (!contribution) {
      return { error: "Contribution not found." };
    }

    await prisma.goalContribution.delete({
      where: {
        id: contribution.id,
      },
    });

    await updateGoalCompletion(contribution.goalId);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/goals");

    return {
      success: "Contribution deleted successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return {
        error: "Your session has expired. Please sign in again.",
      };
    }

    console.error("Delete goal contribution error:", error);

    return {
      error: "Unable to delete the contribution. Please try again.",
    };
  }
}
