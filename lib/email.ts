import { Resend } from "resend";

type PasswordResetEmailInput = {
  recipientEmail: string;
  recipientName: string | null;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  recipientEmail,
  recipientName,
  resetUrl,
}: PasswordResetEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  const resend = new Resend(apiKey);
  const safeName = recipientName?.trim() || "there";

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [recipientEmail],
    subject: "Reset your Spendly password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #172033;">
        <div style="background: #111936; padding: 32px; border-radius: 16px;">
          <h1 style="color: #ffffff; margin: 0 0 16px;">Reset your Spendly password</h1>
          <p style="color: #d8ddf0; line-height: 1.6;">
            Hi ${safeName},
          </p>
          <p style="color: #d8ddf0; line-height: 1.6;">
            We received a request to reset your Spendly password. Click the button below to choose a new password.
          </p>
          <p style="margin: 28px 0;">
            <a
              href="${resetUrl}"
              style="display: inline-block; background: #8b5cf6; color: #ffffff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;"
            >
              Reset password
            </a>
          </p>
          <p style="color: #aeb6d0; line-height: 1.6; font-size: 14px;">
            This link expires in 60 minutes and can only be used once.
          </p>
          <p style="color: #aeb6d0; line-height: 1.6; font-size: 14px;">
            If you did not request this reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
