import { formatDateValue, formatLocalDateTimeValue } from "../dateFormatting";
import type { DateRangeValue, DateTimeRangeValue } from "../types";
import { DATE_RANGE_SEPARATOR } from "./dateRangeInputTypes";

export function formatDateRangeValue(value: DateRangeValue, locale: string): string {
  const from = formatDateValue(value.from, locale);
  const to = formatDateValue(value.to, locale);
  return from || to ? `${from}${DATE_RANGE_SEPARATOR}${to}` : "";
}

export function formatDateTimeRangeValue(value: DateTimeRangeValue, locale: string): string {
  const from = formatLocalDateTimeValue(value.from, locale);
  const to = formatLocalDateTimeValue(value.to, locale);
  return from || to ? `${from}${DATE_RANGE_SEPARATOR}${to}` : "";
}
