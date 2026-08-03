import { TZDate } from "@date-fns/tz";
import type { DateValue, LocalDateTimeValue, TimeValue } from "./types";

export function zonedNow(now: Date, timeZone: string): TZDate {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format(now);
    return new TZDate(now.getTime(), timeZone);
  } catch {
    throw new RangeError(`Invalid time zone: ${timeZone}`);
  }
}

export function serializeZonedDate(date: Date): DateValue {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` as DateValue;
}

export function serializeZonedTime(date: Date): TimeValue {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` as TimeValue;
}

export function serializeZonedDateTime(date: Date): LocalDateTimeValue {
  return `${serializeZonedDate(date)}T${serializeZonedTime(date)}` as LocalDateTimeValue;
}
