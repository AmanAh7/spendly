import { NextResponse } from "next/server";

import { processDueAutomaticRecurringExpenses } from "@/lib/recurring-expense-processor";

function isAuthorized(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;

  if (!configuredSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${configuredSecret}`;
}

async function handleCron(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const result = await processDueAutomaticRecurringExpenses();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Recurring expense cron error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Recurring expense processing failed.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
