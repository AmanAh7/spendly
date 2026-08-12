/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Income` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Income" DROP CONSTRAINT "Income_categoryId_fkey";

-- DropIndex
DROP INDEX "Income_userId_categoryId_idx";

-- AlterTable
ALTER TABLE "Income" DROP COLUMN "categoryId";
