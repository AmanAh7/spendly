import { z } from "zod";

export const categoryTypeValues = ["EXPENSE", "INCOME", "BOTH"] as const;

export const categorySchema = z.object({
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
  type: z.enum(categoryTypeValues),
});

export type CategoryInput = z.infer<typeof categorySchema>;
