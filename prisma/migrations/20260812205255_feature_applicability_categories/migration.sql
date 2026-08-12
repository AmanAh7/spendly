/*
  Warnings:

  - You are about to drop the column `type` on the `Category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Category_userId_type_idx";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "type",
ADD COLUMN     "appliesToBudgets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "appliesToExpenses" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "appliesToGoals" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "appliesToRecurringExpenses" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "CategoryType";

-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "Category"("userId");
