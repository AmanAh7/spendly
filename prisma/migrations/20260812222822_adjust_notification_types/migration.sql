/*
  Warnings:

  - The values [BUDGET_APPROACHING,RECURRING_UPCOMING,FINANCIAL_EVENT,SYSTEM] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('BUDGET_APPROACHING_LIMIT', 'BUDGET_EXCEEDED', 'RECURRING_EXPENSE_UPCOMING', 'RECURRING_EXPENSE_OVERDUE', 'GOAL_MILESTONE');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
