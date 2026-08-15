import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SettingsManager } from "@/components/settings/settings-manager";
import {
  currencyValues,
  settingsSchema,
  themeValues,
} from "@/lib/validators/settings";
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

  const theme = themeValues.includes(user.theme as (typeof themeValues)[number])
    ? (user.theme as (typeof themeValues)[number])
    : "system";

  const initialSettings = settingsSchema.parse({
    name: user.name ?? "",
    currency,
    theme,
  });

  return <SettingsManager initialSettings={initialSettings} />;
}
