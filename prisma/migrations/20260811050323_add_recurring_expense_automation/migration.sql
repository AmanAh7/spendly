-- CreateEnum
CREATE TYPE "RecurringGenerationMode" AS ENUM ('MANUAL', 'AUTOMATIC');

-- AlterTable
ALTER TABLE "RecurringExpense" ADD COLUMN     "generationMode" "RecurringGenerationMode" NOT NULL DEFAULT 'MANUAL';

-- CreateTable
CREATE TABLE "RecurringExpenseOccurrence" (
    "id" TEXT NOT NULL,
    "recurringExpenseId" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringExpenseOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecurringExpenseOccurrence_expenseId_key" ON "RecurringExpenseOccurrence"("expenseId");

-- CreateIndex
CREATE INDEX "RecurringExpenseOccurrence_recurringExpenseId_dueDate_idx" ON "RecurringExpenseOccurrence"("recurringExpenseId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringExpenseOccurrence_recurringExpenseId_dueDate_key" ON "RecurringExpenseOccurrence"("recurringExpenseId", "dueDate");

-- CreateIndex
CREATE INDEX "RecurringExpense_userId_generationMode_idx" ON "RecurringExpense"("userId", "generationMode");

-- AddForeignKey
ALTER TABLE "RecurringExpenseOccurrence" ADD CONSTRAINT "RecurringExpenseOccurrence_recurringExpenseId_fkey" FOREIGN KEY ("recurringExpenseId") REFERENCES "RecurringExpense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringExpenseOccurrence" ADD CONSTRAINT "RecurringExpenseOccurrence_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
