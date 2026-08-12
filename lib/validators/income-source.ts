import { z } from "zod";

export const incomeSourceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Source name must contain at least 2 characters.")
    .max(60, "Source name must be 60 characters or fewer."),
});

export type IncomeSourceInput = z.infer<typeof incomeSourceSchema>;
