import { startOfMonth } from "date-fns";
import { dateValueToLocalDate } from "../date/dateMath";
import type { DateValue } from "../date/types";

export function clampCalendarMonth(
  month: Date,
  minDate?: DateValue,
  maxDate?: DateValue
): Date {
  const candidate = startOfMonth(month);
  const minimum = minDate ? startOfMonth(dateValueToLocalDate(minDate)) : null;
  const maximum = maxDate ? startOfMonth(dateValueToLocalDate(maxDate)) : null;
  if (minimum && candidate < minimum) return minimum;
  if (maximum && candidate > maximum) return maximum;
  return candidate;
}
