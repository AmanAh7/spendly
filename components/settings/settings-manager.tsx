"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Moon,
  Monitor,
  Save,
  Sun,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  changePassword,
  type SettingsActionResult,
  updateSettings,
} from "@/actions/settings-actions";
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

const themeOptions = [
  {
    value: "system",
    label: "System",
    description: "Match your device preference.",
    icon: Monitor,
  },
  {
    value: "light",
    label: "Light",
    description: "Use a light appearance.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use a dark appearance.",
    icon: Moon,
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
  const { setTheme } = useTheme();
  const [feedback, setFeedback] = useState<SettingsActionResult | null>(null);
  const [passwordFeedback, setPasswordFeedback] =
    useState<SettingsActionResult | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, startPasswordTransition] = useTransition();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });

  useEffect(() => {
    form.reset(initialSettings);
  }, [form, initialSettings]);

  function handleThemeChange(nextTheme: SettingsInput["theme"]) {
    form.setValue("theme", nextTheme, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function submitSettings(values: SettingsInput) {
    startTransition(async () => {
      const result = await updateSettings(values);

      setFeedback(result);

      if (result.success) {
        setTheme(values.theme);
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

  const selectedCurrency = form.watch("currency");
  const selectedTheme = form.watch("theme");
  const selectedDateFormat = form.watch("dateFormat");

  return (
    <div className="space-y-6">
      <Toast
        message={feedback?.error ?? feedback?.success ?? null}
        variant={feedback?.error ? "error" : "success"}
        onDismiss={() => setFeedback(null)}
      />

      <div>
        <p className="text-sm text-muted-foreground">Account</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your profile and spending preferences.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(submitSettings)} className="space-y-6">
        <section className="glass-panel-strong rounded-3xl p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose the name shown on your dashboard.
              </p>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
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
        </section>

        <section className="glass-panel-strong rounded-3xl p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <WalletCards className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Currency</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select how monetary values are displayed throughout Spendly.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {currencyOptions.map((currency) => {
              const isSelected = selectedCurrency === currency.value;

              return (
                <label
                  key={currency.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background/20 hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    value={currency.value}
                    className="sr-only"
                    {...form.register("currency")}
                  />

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/70 text-lg font-semibold">
                    {currency.symbol}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {currency.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {currency.value}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {form.formState.errors.currency ? (
            <p className="mt-3 text-xs text-destructive">
              {form.formState.errors.currency.message}
            </p>
          ) : null}
        </section>

        <section className="glass-panel-strong rounded-3xl p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Date format</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose how calendar dates are displayed in Spendly.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {dateFormatOptions.map((dateFormatOption) => {
              const isSelected = selectedDateFormat === dateFormatOption.value;

              return (
                <label
                  key={dateFormatOption.value}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background/20 hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    value={dateFormatOption.value}
                    className="sr-only"
                    {...form.register("dateFormat")}
                  />

                  <span className="block text-sm font-medium">
                    {dateFormatOption.label}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Example: {dateFormatOption.example}
                  </span>
                </label>
              );
            })}
          </div>

          {form.formState.errors.dateFormat ? (
            <p className="mt-3 text-xs text-destructive">
              {form.formState.errors.dateFormat.message}
            </p>
          ) : null}
        </section>

        <section className="glass-panel-strong rounded-3xl p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Appearance</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how Spendly looks on this device.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {themeOptions.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = selectedTheme === themeOption.value;

              return (
                <button
                  key={themeOption.value}
                  type="button"
                  onClick={() =>
                    handleThemeChange(
                      themeOption.value as SettingsInput["theme"],
                    )
                  }
                  disabled={isPending}
                  aria-pressed={isSelected}
                  className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background/20 hover:border-primary/50"
                  }`}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="mt-4 block text-sm font-medium">
                    {themeOption.label}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {themeOption.description}
                  </span>
                </button>
              );
            })}
          </div>

          {form.formState.errors.theme ? (
            <p className="mt-3 text-xs text-destructive">
              {form.formState.errors.theme.message}
            </p>
          ) : null}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !form.formState.isDirty}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>

      <section className="glass-panel-strong rounded-3xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Change Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your account password. You will remain signed in.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-xl">
          <Toast
            message={
              passwordFeedback?.error ?? passwordFeedback?.success ?? null
            }
            variant={passwordFeedback?.error ? "error" : "success"}
            onDismiss={() => setPasswordFeedback(null)}
          />

          <form action={submitChangePassword} className="space-y-5">
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
                  onClick={() => setShowCurrentPassword((visible) => !visible)}
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
                    showNewPassword ? "Hide new password" : "Show new password"
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
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {isChangingPassword ? "Changing..." : "Change password"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
