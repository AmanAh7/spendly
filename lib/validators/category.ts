import { z } from "zod";

export const categorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must contain at least 2 characters.")
      .max(60, "Category name must be 60 characters or fewer."),
    icon: z
      .string()
      .trim()
      .min(1, "Select an icon.")
      .max(40, "Icon name is too long."),
    color: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Select a valid color."),
    appliesToExpenses: z.boolean(),
    appliesToBudgets: z.boolean(),
    appliesToRecurringExpenses: z.boolean(),
    appliesToGoals: z.boolean(),
  })
  .refine(
    (values) =>
      values.appliesToExpenses ||
      values.appliesToBudgets ||
      values.appliesToRecurringExpenses ||
      values.appliesToGoals,
    {
      message: "Select at least one feature this category applies to.",
    },
  );

export type CategoryInput = z.infer<typeof categorySchema>;
