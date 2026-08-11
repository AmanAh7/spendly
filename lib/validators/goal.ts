import { z } from "zod";

const amountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount with up to 2 decimals.")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero.");

export const goalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Goal name must contain at least 2 characters.")
    .max(120, "Goal name must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  targetAmount: amountSchema,
  categoryId: z.string().optional().or(z.literal("")),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid target date.")
    .optional()
    .or(z.literal("")),
});

export const contributionSchema = z.object({
  amount: amountSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date."),
  note: z
    .string()
    .trim()
    .max(500, "Note must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export type GoalInput = z.infer<typeof goalSchema>;
export type ContributionInput = z.infer<typeof contributionSchema>;
