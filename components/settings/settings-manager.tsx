"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Eye, EyeOff, Lock, Save, Trash2 } from "lucide-react";

import {
  changePassword,
  deleteAccount,
  type SettingsActionResult,
  updateSettings,
} from "@/actions/settings-actions";
import { signOutUser } from "@/actions/auth-actions";
import { Toast } from "@/components/ui/toast";
import { settingsSchema, type SettingsInput } from "@/lib/validators/settings";

type SettingsManagerProps = {
  initialSettings: SettingsInput;
};

const currencyOptions = [
  {
    value: "INR",
    label: "Indian Rupee",
    symbol: "₹",
  },
  {
    value: "USD",
    label: "US Dollar",
    symbol: "$",
  },
  {
    value: "EUR",
    label: "Euro",
    symbol: "€",
  },
  {
    value: "GBP",
    label: "British Pound",
    symbol: "£",
  },
] as const;

const dateFormatOptions = [
  {
    value: "DD/MM/YYYY",
    label: "Day / Month / Year",
    example: "16/08/2026",
  },
  {
    value: "MM/DD/YYYY",
    label: "Month / Day / Year",
    example: "08/16/2026",
  },
  {
    value: "YYYY-MM-DD",
    label: "Year - Month - Day",
    example: "2026-08-16",
  },
] as const;

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<SettingsActionResult | null>(null);
  const [passwordFeedback, setPasswordFeedback] =
    useState<SettingsActionResult | null>(null);
  const [deleteFeedback, setDeleteFeedback] =
    useState<SettingsActionResult | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isChangingPassword, startPasswordTransition] = useTransition();
  const [isDeletingAccount, startDeleteTransition] = useTransition();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });

  useEffect(() => {
    form.reset(initialSettings);
  }, [form, initialSettings]);

  function submitSettings(values: SettingsInput) {
    startTransition(async () => {
      // Force dark theme for DB compatibility
      const result = await updateSettings({
        ...values,
        theme: "dark",
      });

      setFeedback(result);

      if (result.success) {
        router.refresh();
      }
    });
  }

  function submitChangePassword(formData: FormData) {
    startPasswordTransition(async () => {
      const currentPassword = String(formData.get("currentPassword") ?? "");
      const newPassword = String(formData.get("newPassword") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");

      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordFeedback(result);

      if (result.success) {
        (
          document.getElementById("currentPassword") as HTMLInputElement | null
        )?.form?.reset();

        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    });
  }

  function submitDeleteAccount(formData: FormData) {
    const confirmed = window.confirm(
      "Delete your account permanently? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    startDeleteTransition(async () => {
      const currentPassword = String(
        formData.get("deleteCurrentPassword") ?? "",
      );
      const confirmationPhrase = String(
        formData.get("confirmationPhrase") ?? "",
      );

      const result = await deleteAccount({
        currentPassword,
        confirmationPhrase: confirmationPhrase as "DELETE",
      });

      setDeleteFeedback(result);

      if (result.success) {
        await signOutUser();
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <Toast
        message={feedback?.error ?? feedback?.success ?? null}
        variant={feedback?.error ? "error" : "success"}
        onDismiss={() => setFeedback(null)}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Account</p>
          <h1 className="mt-1 text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and spending preferences.
          </p>
        </div>

        <div className="hidden sm:block">
          <button
            type="submit"
            form="settings-form"
            disabled={isPending || !form.formState.isDirty}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      <form
        id="settings-form"
        onSubmit={form.handleSubmit(submitSettings)}
        className="glass-panel-strong rounded-2xl p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="settings-name"
              className="mb-2 block text-sm font-medium"
            >
              Display name
            </label>

            <input
              id="settings-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              {...form.register("name")}
              className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />

            {form.formState.errors.name ? (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Currency</label>

            <select
              {...form.register("currency")}
              className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              {currencyOptions.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label} ({currency.symbol})
                </option>
              ))}
            </select>

            {form.formState.errors.currency ? (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.currency.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Date format
            </label>

            <select
              {...form.register("dateFormat")}
              className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              {dateFormatOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {form.formState.errors.dateFormat ? (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.dateFormat.message}
              </p>
            ) : null}
          </div>

          <div className="sr-only">
            {/* Hidden field to satisfy schema; always "dark" */}
            <input type="hidden" {...form.register("theme")} value="dark" />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending || !form.formState.isDirty}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>

      <section className="glass-panel-strong overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Change Password</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Update your account password. You will remain signed in.
            </p>
          </div>
        </div>

        <div className="px-5 py-4">
          <Toast
            message={
              passwordFeedback?.error ?? passwordFeedback?.success ?? null
            }
            variant={passwordFeedback?.error ? "error" : "success"}
            onDismiss={() => setPasswordFeedback(null)}
          />

          <form action={submitChangePassword} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  Current password
                </label>

                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isChangingPassword}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Enter your current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword((visible) => !visible)
                    }
                    disabled={isChangingPassword}
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  New password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    disabled={isChangingPassword}
                    className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="At least 8 characters"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((visible) => !visible)}
                    disabled={isChangingPassword}
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm new password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  disabled={isChangingPassword}
                  className="h-11 w-full rounded-xl border border-input bg-background/40 px-3 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="Repeat your new password"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  disabled={isChangingPassword}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm new password"
                      : "Show confirm new password"
                  }
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Use at least 8 characters with uppercase, lowercase, and a number.
            </p>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                {isChangingPassword ? "Changing..." : "Change password"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="glass-panel-strong overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-destructive">
                Danger Zone
              </h2>
              <p className="text-xs text-muted-foreground">
                Permanently delete your Spendly account and all associated
                financial data.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <Toast
            message={deleteFeedback?.error ?? deleteFeedback?.success ?? null}
            variant={deleteFeedback?.error ? "error" : "success"}
            onDismiss={() => setDeleteFeedback(null)}
          />

          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">
              This action cannot be undone.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Deleting your account permanently removes your profile,
              categories, expenses, income, budgets, goals, recurring expenses,
              notifications, and password-reset tokens.
            </p>
          </div>

          <form action={submitDeleteAccount} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="deleteCurrentPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  Current password
                </label>

                <div className="relative">
                  <input
                    id="deleteCurrentPassword"
                    name="deleteCurrentPassword"
                    type={showDeletePassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isDeletingAccount}
                    className="h-11 w-full rounded-xl border border-destructive/40 bg-background/40 px-3 pr-11 text-sm outline-none transition focus:border-destructive focus:ring-2 focus:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Enter your current password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowDeletePassword((visible) => !visible)}
                    disabled={isDeletingAccount}
                    aria-label={
                      showDeletePassword
                        ? "Hide current password for account deletion"
                        : "Show current password for account deletion"
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {showDeletePassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmationPhrase"
                  className="mb-2 block text-sm font-medium"
                >
                  Type DELETE to confirm
                </label>

                <input
                  id="confirmationPhrase"
                  name="confirmationPhrase"
                  type="text"
                  autoComplete="off"
                  required
                  disabled={isDeletingAccount}
                  className="h-11 w-full rounded-xl border border-destructive/40 bg-background/40 px-3 text-sm outline-none transition focus:border-destructive focus:ring-2 focus:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="DELETE"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isDeletingAccount}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-medium text-destructive-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {isDeletingAccount ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
