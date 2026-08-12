-- This is an empty migration.-- Backfill: enable all 4 applicability flags for existing default categories
UPDATE "Category"
SET
  "appliesToExpenses" = true,
  "appliesToBudgets" = true,
  "appliesToRecurringExpenses" = true,
  "appliesToGoals" = true
WHERE
  "isDefault" = true
  AND "name" IN (
    'Food & Dining',
    'Transport',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Health',
    'Education',
    'Travel',
    'Rent',
    'Other'
  );