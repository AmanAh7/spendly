import { z } from "zod";
import { isNonFutureCalendarDate } from "@/lib/utils/date-validation";

export const incomeSchema = z.object({
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
  sourceId: z.string().min(1, "Select an income source."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date.")
    .refine(
      (value) => isNonFutureCalendarDate(value),
      "Normal income cannot have a future date.",
    ),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export type IncomeInput = z.infer<typeof incomeSchema>;
