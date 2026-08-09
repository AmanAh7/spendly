import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@spendly.local";

function dateAtMidnight(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

async function main() {
  await prisma.user.deleteMany({
    where: {
      email: DEMO_EMAIL,
    },
  });

  const passwordHash = await bcrypt.hash("SpendlyDemo123!", 12);

  const user = await prisma.user.create({
    data: {
      name: "Spendly Demo User",
      email: DEMO_EMAIL,
      passwordHash,
      currency: "INR",
      theme: "dark",
      dateFormat: "DD/MM/YYYY",
    },
  });

  const categoryDefinitions = [
    {
      name: "Food & Dining",
      icon: "Utensils",
      color: "#F97316",
      type: "EXPENSE" as const,
    },
    {
      name: "Transport",
      icon: "Car",
      color: "#3B82F6",
      type: "EXPENSE" as const,
    },
    {
      name: "Shopping",
      icon: "ShoppingBag",
      color: "#EC4899",
      type: "EXPENSE" as const,
    },
    {
      name: "Bills & Utilities",
      icon: "Receipt",
      color: "#EAB308",
      type: "EXPENSE" as const,
    },
    {
      name: "Entertainment",
      icon: "Clapperboard",
      color: "#A855F7",
      type: "EXPENSE" as const,
    },
    {
      name: "Health",
      icon: "HeartPulse",
      color: "#EF4444",
      type: "EXPENSE" as const,
    },
    {
      name: "Education",
      icon: "GraduationCap",
      color: "#14B8A6",
      type: "EXPENSE" as const,
    },
    {
      name: "Travel",
      icon: "Plane",
      color: "#06B6D4",
      type: "EXPENSE" as const,
    },
    {
      name: "Rent",
      icon: "House",
      color: "#6366F1",
      type: "EXPENSE" as const,
    },
    {
      name: "Other",
      icon: "Tag",
      color: "#64748B",
      type: "BOTH" as const,
    },
  ];

  const categories = new Map<
    string,
    {
      id: string;
      name: string;
    }
  >();

  for (const definition of categoryDefinitions) {
    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name: definition.name,
        icon: definition.icon,
        color: definition.color,
        type: definition.type,
        isDefault: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    categories.set(category.name, category);
  }

  const food = categories.get("Food & Dining");
  const transport = categories.get("Transport");
  const bills = categories.get("Bills & Utilities");
  const entertainment = categories.get("Entertainment");
  const rent = categories.get("Rent");
  const other = categories.get("Other");

  if (!food || !transport || !bills || !entertainment || !rent || !other) {
    throw new Error("Required seed categories were not created.");
  }

  await prisma.expense.createMany({
    data: [
      {
        userId: user.id,
        categoryId: food.id,
        amount: new Prisma.Decimal("450.00"),
        description: "Weekend groceries",
        paymentMethod: "UPI",
        date: dateAtMidnight("2026-08-02"),
        notes: "Fresh produce and household groceries",
      },
      {
        userId: user.id,
        categoryId: transport.id,
        amount: new Prisma.Decimal("180.00"),
        description: "Metro and cab rides",
        paymentMethod: "UPI",
        date: dateAtMidnight("2026-08-04"),
      },
      {
        userId: user.id,
        categoryId: bills.id,
        amount: new Prisma.Decimal("1499.00"),
        description: "Internet bill",
        paymentMethod: "CREDIT_CARD",
        date: dateAtMidnight("2026-08-05"),
      },
      {
        userId: user.id,
        categoryId: entertainment.id,
        amount: new Prisma.Decimal("699.00"),
        description: "Streaming subscription",
        paymentMethod: "CREDIT_CARD",
        date: dateAtMidnight("2026-08-06"),
      },
      {
        userId: user.id,
        categoryId: rent.id,
        amount: new Prisma.Decimal("18000.00"),
        description: "Monthly rent",
        paymentMethod: "BANK_TRANSFER",
        date: dateAtMidnight("2026-08-01"),
      },
    ],
  });

  await prisma.income.createMany({
    data: [
      {
        userId: user.id,
        amount: new Prisma.Decimal("65000.00"),
        description: "Monthly salary",
        source: "SALARY",
        date: dateAtMidnight("2026-08-01"),
        notes: "Development-only demo income",
      },
      {
        userId: user.id,
        categoryId: other.id,
        amount: new Prisma.Decimal("5000.00"),
        description: "Freelance project payment",
        source: "FREELANCE",
        date: dateAtMidnight("2026-08-07"),
      },
    ],
  });

  await prisma.budget.createMany({
    data: [
      {
        userId: user.id,
        categoryId: food.id,
        name: "Food & Dining",
        amount: new Prisma.Decimal("8000.00"),
        periodStart: dateAtMidnight("2026-08-01"),
        periodEnd: dateAtMidnight("2026-08-31"),
      },
      {
        userId: user.id,
        categoryId: transport.id,
        name: "Transport",
        amount: new Prisma.Decimal("5000.00"),
        periodStart: dateAtMidnight("2026-08-01"),
        periodEnd: dateAtMidnight("2026-08-31"),
      },
      {
        userId: user.id,
        name: "Overall Monthly Budget",
        amount: new Prisma.Decimal("40000.00"),
        periodStart: dateAtMidnight("2026-08-01"),
        periodEnd: dateAtMidnight("2026-08-31"),
      },
    ],
  });

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Emergency Fund",
      description: "Build a six-month emergency reserve.",
      targetAmount: new Prisma.Decimal("200000.00"),
      targetDate: dateAtMidnight("2027-03-31"),
    },
  });

  await prisma.goalContribution.createMany({
    data: [
      {
        userId: user.id,
        goalId: goal.id,
        amount: new Prisma.Decimal("25000.00"),
        date: dateAtMidnight("2026-07-31"),
        note: "Initial contribution",
      },
      {
        userId: user.id,
        goalId: goal.id,
        amount: new Prisma.Decimal("15000.00"),
        date: dateAtMidnight("2026-08-05"),
        note: "Monthly contribution",
      },
    ],
  });

  await prisma.recurringExpense.createMany({
    data: [
      {
        userId: user.id,
        categoryId: entertainment.id,
        amount: new Prisma.Decimal("699.00"),
        description: "Streaming subscription",
        paymentMethod: "CREDIT_CARD",
        frequency: "MONTHLY",
        nextDueDate: dateAtMidnight("2026-09-06"),
        isActive: true,
      },
      {
        userId: user.id,
        categoryId: bills.id,
        amount: new Prisma.Decimal("1499.00"),
        description: "Internet",
        paymentMethod: "CREDIT_CARD",
        frequency: "MONTHLY",
        nextDueDate: dateAtMidnight("2026-09-05"),
        isActive: true,
      },
      {
        userId: user.id,
        categoryId: rent.id,
        amount: new Prisma.Decimal("18000.00"),
        description: "Rent",
        paymentMethod: "BANK_TRANSFER",
        frequency: "MONTHLY",
        nextDueDate: dateAtMidnight("2026-09-01"),
        isActive: true,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: "RECURRING_UPCOMING",
        title: "Upcoming recurring payment",
        message: "Your internet payment of ₹1,499 is due soon.",
        link: "/dashboard/recurring",
      },
      {
        userId: user.id,
        type: "GOAL_MILESTONE",
        title: "Great progress on your goal",
        message: "You have saved ₹40,000 toward your Emergency Fund.",
        link: "/dashboard/goals",
      },
    ],
  });

  console.log("Development seed completed.");
  console.log(`Demo email: ${DEMO_EMAIL}`);
  console.log("Demo password: SpendlyDemo123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
