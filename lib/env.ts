// lib/env.ts
import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Server-side environment variables (NOT exposed to the client)
// ─────────────────────────────────────────────────────────────
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(), // Optional
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  NEXT_PUBLIC_APP_URL: z.string().url(), // Also used on client, but validated here too
  CRON_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
});

// ─────────────────────────────────────────────────────────────
// Client-side environment variables (NEXT_PUBLIC_*)
// Only these are safe to expose to the browser.
// ─────────────────────────────────────────────────────────────
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// Validate server env at module load (server-side only)
export const serverEnv = serverEnvSchema.parse(process.env);

// Validate client env (safe to reference in client components)
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

// Optional helper: export a type-safe env object for use in server code
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
