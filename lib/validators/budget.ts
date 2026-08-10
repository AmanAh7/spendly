import { z } from "zod";

export const budgetSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Budget name must contain at least 2 characters.")
      .max(120, "Budget name must be 120 characters or fewer."),
    amount: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount with up to 2 decimals.")
      .refine(
        (value) => Number(value) > 0,
        "Amount must be greater than zero.",
      ),
    categoryId: z.string().optional().or(z.literal("")),
    periodStart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid start date."),
    periodEnd: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid end date."),
  })
  .refine((value) => value.periodStart <= value.periodEnd, {
    path: ["periodEnd"],
    message: "End date must be on or after the start date.",
  });

export type BudgetInput = z.infer<typeof budgetSchema>;
