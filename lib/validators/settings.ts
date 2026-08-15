import { z } from "zod";

export const currencyValues = ["INR", "USD", "EUR", "GBP"] as const;

export const themeValues = ["system", "light", "dark"] as const;

export const settingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  currency: z.enum(currencyValues, {
    message: "Select a valid currency.",
  }),
  theme: z.enum(themeValues, {
    message: "Select a valid theme.",
  }),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
