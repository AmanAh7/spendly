// lib/utils/date-validation.ts

// Returns today's date as YYYY-MM-DD based on the environment's calendar day.
export function getTodayDateString(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Returns true if dateString (YYYY-MM-DD) is today or in the past,
// false if it is strictly in the future.
export function isNonFutureCalendarDate(dateString: string): boolean {
  // Assume dateString is already validated as YYYY-MM-DD.
  const inputDateUtcMidnight = new Date(`${dateString}T00:00:00.000Z`);

  const todayString = getTodayDateString();
  const todayUtcMidnight = new Date(`${todayString}T00:00:00.000Z`);

  return inputDateUtcMidnight <= todayUtcMidnight;
}
