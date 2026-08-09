import { z } from "zod";

export const paymentMethodValues = [
  "CASH",
  "UPI",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "BANK_TRANSFER",
  "OTHER",
] as const;

export const expenseSchema = z.object({
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
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date."),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
