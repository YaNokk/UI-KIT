import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subYears
} from "date-fns";
import { parseDateValue } from "./parseDateValue";
import { serializeDateValue } from "./serializeDateValue";
import type { DateValue, WeekStartsOn } from "./types";

export function dateValueToLocalDate(value: DateValue): Date {
  const parts = parseDateValue(value);
  if (!parts) throw new RangeError(`Invalid DateValue: ${value}`);
  return new Date(parts.year, parts.month - 1, parts.day, 12);
}

export function addDateDays(value: DateValue, amount: number): DateValue {
  return serializeDateValue(addDays(dateValueToLocalDate(value), amount));
}

export function addDateMonths(value: DateValue, amount: number): DateValue {
  return serializeDateValue(addMonths(dateValueToLocalDate(value), amount));
}

export function addDateYears(value: DateValue, amount: number): DateValue {
  return serializeDateValue(addYears(dateValueToLocalDate(value), amount));
}

export function dateDurationDays(from: DateValue, to: DateValue): number {
  return differenceInCalendarDays(dateValueToLocalDate(to), dateValueToLocalDate(from)) + 1;
}

export const dateFns = {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subYears
};

export function weekOptions(weekStartsOn: WeekStartsOn) {
  return { weekStartsOn } as const;
}
