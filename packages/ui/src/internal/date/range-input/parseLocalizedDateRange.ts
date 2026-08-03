import { parseLocalizedDate, parseLocalizedDateTime } from "../dateFormatting";
import type { DateRangeValue, DateTimeRangeValue } from "../types";

function splitRange(text: string): [string, string] | null {
  const parts = text.split(/\s+[–—-]\s+/u);
  return parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined
    ? [parts[0], parts[1]]
    : null;
}

export function parseLocalizedDateRange(text: string, locale: string): DateRangeValue | null {
  const parts = splitRange(text.trim());
  if (!parts) return null;
  const from = parseLocalizedDate(parts[0], locale);
  const to = parseLocalizedDate(parts[1], locale);
  return from && to ? { from, to } : null;
}

export function parseLocalizedDateTimeRange(text: string, locale: string): DateTimeRangeValue | null {
  const parts = splitRange(text.trim());
  if (!parts) return null;
  const from = parseLocalizedDateTime(parts[0], locale);
  const to = parseLocalizedDateTime(parts[1], locale);
  return from && to ? { from, to } : null;
}
