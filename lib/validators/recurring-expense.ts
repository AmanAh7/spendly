import { z } from "zod";

import { paymentMethodValues } from "@/lib/validators/expense";

export const recurringFrequencyValues = [
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
] as const;

export const recurringGenerationModeValues = ["MANUAL", "AUTOMATIC"] as const;

export const recurringExpenseSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount with up to 2 decimals.")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero."),
  description: z
    .string()
    .trim()
    .min(2, "Description must contain at least 2 characters.")
    .max(120, "Description must be 120 characters or fewer."),
  categoryId: z.string().min(1, "Select a category."),
  paymentMethod: z.enum(paymentMethodValues),
  frequency: z.enum(recurringFrequencyValues),
  generationMode: z.enum(recurringGenerationModeValues),
  nextDueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid due date."),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export type RecurringExpenseInput = z.infer<typeof recurringExpenseSchema>;
