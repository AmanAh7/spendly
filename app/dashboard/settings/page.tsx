import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SettingsManager } from "@/components/settings/settings-manager";
import {
  currencyValues,
  settingsSchema,
  themeValues,
} from "@/lib/validators/settings";
import { dateFormatValues } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      currency: true,
      theme: true,
      dateFormat: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const currency = currencyValues.includes(
    user.currency as (typeof currencyValues)[number],
  )
    ? (user.currency as (typeof currencyValues)[number])
    : "INR";

  // Force dark theme for UI while keeping DB field compatible
  const theme: (typeof themeValues)[number] = "dark";

  const dateFormat = dateFormatValues.includes(
    user.dateFormat as (typeof dateFormatValues)[number],
  )
    ? (user.dateFormat as (typeof dateFormatValues)[number])
    : "DD/MM/YYYY";

  const initialSettings = settingsSchema.parse({
    name: user.name ?? "",
    currency,
    theme,
    dateFormat,
  });

  return <SettingsManager initialSettings={initialSettings} />;
}
