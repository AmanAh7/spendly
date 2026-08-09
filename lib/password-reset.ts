import { createHash, randomBytes } from "node:crypto";

export const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 60;

export function generatePasswordResetToken() {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(rawToken);

  return {
    rawToken,
    tokenHash,
  };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiry() {
  const expiry = new Date();

  expiry.setMinutes(expiry.getMinutes() + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES);

  return expiry;
}

export function getPasswordResetUrl(token: string) {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "");

  return `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
