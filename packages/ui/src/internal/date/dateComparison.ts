import type { DateRangeValue, DateTimeRangeValue, DateValue, LocalDateTimeValue } from "./types";

export function compareDateValues(a: DateValue, b: DateValue): number {
  return a.localeCompare(b);
}

export function compareLocalDateTimeValues(
  a: LocalDateTimeValue,
  b: LocalDateTimeValue
): number {
  return a.localeCompare(b);
}

export function equalDateRanges(a: DateRangeValue, b: DateRangeValue): boolean {
  return a.from === b.from && a.to === b.to;
}

export function equalDateTimeRanges(a: DateTimeRangeValue, b: DateTimeRangeValue): boolean {
  return a.from === b.from && a.to === b.to;
}
