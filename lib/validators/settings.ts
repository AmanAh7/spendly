import { z } from "zod";

import { dateFormatValues } from "@/lib/format";

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
  dateFormat: z.enum(dateFormatValues, {
    message: "Select a valid date format.",
  }),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer.")
      .regex(/[A-Z]/, "Password must contain an uppercase letter.")
      .regex(/[a-z]/, "Password must contain a lowercase letter.")
      .regex(/[0-9]/, "Password must contain a number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  confirmationPhrase: z.literal("DELETE", {
    message: "Type DELETE to confirm account deletion.",
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
