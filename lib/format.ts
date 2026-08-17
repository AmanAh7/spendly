import { format, isValid, parseISO } from "date-fns";

export const dateFormatValues = [
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
] as const;

export type DateFormat = (typeof dateFormatValues)[number];

const currencyMap: Record<string, string> = {
  INR: "INR",
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
};

const dateFormatPatternMap: Record<DateFormat, string> = {
  "DD/MM/YYYY": "dd/MM/yyyy",
  "MM/DD/YYYY": "MM/dd/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
};

function isDateFormat(value: string): value is DateFormat {
  return dateFormatValues.includes(value as DateFormat);
}

function toCalendarDate(value: Date | string) {
  if (value instanceof Date) {
    return value;
  }

  return parseISO(value);
}

export function formatDate(
  value: Date | string,
  dateFormat: string = "DD/MM/YYYY",
) {
  const date = toCalendarDate(value);

  if (!isValid(date)) {
    return "";
  }

  const safeDateFormat = isDateFormat(dateFormat) ? dateFormat : "DD/MM/YYYY";

  return format(date, dateFormatPatternMap[safeDateFormat]);
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyMap[currency] ?? "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency = "INR") {
  const symbol =
    currency === "USD"
      ? "$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : "₹";

  if (Math.abs(amount) >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }

  return `${symbol}${amount.toFixed(0)}`;
}
