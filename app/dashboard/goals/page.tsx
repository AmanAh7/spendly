import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoalManager } from "@/components/goals/goal-manager";

function decimalToNumber(value: Prisma.Decimal) {
  return Number(value.toString());
}

function toDateKey(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function GoalsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [user, categories, goals] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        currency: true,
      },
    }),

    prisma.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    }),

    prisma.goal.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          completedAt: "asc",
        },
        {
          targetDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        targetAmount: true,
        targetDate: true,
        completedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        contributions: {
          orderBy: [
            {
              date: "desc",
            },
            {
              createdAt: "desc",
            },
          ],
          select: {
            id: true,
            amount: true,
            date: true,
            note: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const serializedGoals = goals.map((goal) => {
    const saved = goal.contributions.reduce(
      (total, contribution) => total + decimalToNumber(contribution.amount),
      0,
    );

    const target = decimalToNumber(goal.targetAmount);
    const remaining = Math.max(target - saved, 0);
    const progress = target > 0 ? (saved / target) * 100 : 0;

    return {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      targetAmount: target,
      saved,
      remaining,
      progress,
      targetDate: toDateKey(goal.targetDate),
      completedAt: goal.completedAt?.toISOString() ?? null,
      category: goal.category,
      contributions: goal.contributions.map((contribution) => ({
        id: contribution.id,
        amount: decimalToNumber(contribution.amount),
        date: toDateKey(contribution.date),
        note: contribution.note,
      })),
    };
  });

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <GoalManager
          goals={serializedGoals}
          categories={categories}
          currency={user.currency}
        />
      </div>
    </main>
  );
}
