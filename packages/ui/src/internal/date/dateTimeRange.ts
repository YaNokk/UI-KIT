import { differenceInHours } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { compareLocalDateTimeValues } from "./dateComparison";
import { parseLocalDateTimeValue } from "./parseLocalDateTimeValue";
import type { DateTimeRangeValue, LocalDateTimeValue } from "./types";

function localValueToDate(value: LocalDateTimeValue, timeZone?: string): Date {
  const parts = parseLocalDateTimeValue(value);
  if (!parts) throw new RangeError(`Invalid LocalDateTimeValue: ${value}`);
  if (timeZone) {
    return TZDate.tz(
      timeZone,
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute
    );
  }
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

export function validateDateTimeRange(
  value: DateTimeRangeValue,
  maxDuration?: { days?: number; hours?: number },
  timeZone?: string
): boolean {
  if (!value.from || !value.to) return false;
  if (compareLocalDateTimeValues(value.from, value.to) > 0) return false;
  const maximumHours = (maxDuration?.days ?? 0) * 24 + (maxDuration?.hours ?? 0);
  return maximumHours <= 0
    || differenceInHours(
      localValueToDate(value.to, timeZone),
      localValueToDate(value.from, timeZone)
    ) <= maximumHours;
}
