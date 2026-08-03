import type { DateValue } from "./types";
import { dateValueToLocalDate } from "./dateMath";
import { parseDateValue } from "./parseDateValue";

type DatePartName = "day" | "month" | "year";

function getDatePattern(locale: string) {
  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).formatToParts(new Date(2006, 10, 22));
  const order = parts
    .filter((part): part is Intl.DateTimeFormatPart & { type: DatePartName } =>
      part.type === "day" || part.type === "month" || part.type === "year"
    )
    .map((part) => part.type);
  const separator = parts.find((part) => part.type === "literal")?.value || ".";
  return { order, separator };
}

export function formatDateValue(value: DateValue | null, locale: string): string {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(dateValueToLocalDate(value));
}

export function formatDateAccessible(value: DateValue, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long"
  }).format(dateValueToLocalDate(value));
}

export function parseLocalizedDate(text: string, locale: string): DateValue | null {
  const trimmed = text.trim();
  if (parseDateValue(trimmed)) return trimmed as DateValue;
  const numbers = trimmed.match(/\d+/g);
  if (!numbers || numbers.length !== 3) return null;
  const { order } = getDatePattern(locale);
  if (order.length !== 3) return null;
  const record: Partial<Record<DatePartName, string>> = {};
  for (let index = 0; index < order.length; index += 1) {
    const part = order[index];
    const number = numbers[index];
    if (!part || !number) return null;
    record[part] = number;
  }
  const value = `${record.year?.padStart(4, "0")}-${record.month?.padStart(2, "0")}-${record.day?.padStart(2, "0")}`;
  return parseDateValue(value) ? value as DateValue : null;
}

export function getDateInputPlaceholder(locale: string): string {
  const { order, separator } = getDatePattern(locale);
  const labels: Record<DatePartName, string> = { day: "DD", month: "MM", year: "YYYY" };
  return order.map((part) => labels[part]).join(separator);
}

export function formatMonthLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}
