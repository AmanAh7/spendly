import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureDefaultCategories } from "@/lib/default-categories";
import { RecurringExpenseManager } from "@/components/recurring/recurring-expense-manager";

export default async function RecurringExpensesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  await ensureDefaultCategories(userId);

  const [user, categories, recurringExpenses] = await Promise.all([
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
        appliesToRecurringExpenses: true,
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

    prisma.recurringExpense.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          isActive: "desc",
        },
        {
          nextDueDate: "asc",
        },
      ],
      select: {
        id: true,
        amount: true,
        description: true,
        paymentMethod: true,
        frequency: true,
        generationMode: true,
        nextDueDate: true,
        isActive: true,
        notes: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <RecurringExpenseManager
          recurringExpenses={recurringExpenses.map((item) => ({
            id: item.id,
            amount: Number(item.amount.toString()),
            description: item.description,
            paymentMethod: item.paymentMethod,
            frequency: item.frequency,
            generationMode: item.generationMode,
            nextDueDate: item.nextDueDate.toISOString(),
            isActive: item.isActive,
            notes: item.notes,
            category: item.category,
          }))}
          categories={categories}
          currency={user.currency}
        />
      </div>
    </main>
  );
}
