import { compareDateValues, compareLocalDateTimeValues } from "./dateComparison";
import { parseDateValue } from "./parseDateValue";
import { parseTimeValue } from "./parseTimeValue";
import type { DateValue, LocalDateTimeValue, TimeValue } from "./types";

export function isDateAllowed(
  value: DateValue,
  options: {
    minDate?: DateValue | undefined;
    maxDate?: DateValue | undefined;
    isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  }
): boolean {
  return Boolean(parseDateValue(value))
    && (!options.minDate || compareDateValues(value, options.minDate) >= 0)
    && (!options.maxDate || compareDateValues(value, options.maxDate) <= 0)
    && !options.isDateUnavailable?.(value);
}

export function isTimeAllowed(
  value: TimeValue,
  options: {
    minuteStep?: number | undefined;
    minTime?: TimeValue | undefined;
    maxTime?: TimeValue | undefined;
  }
): boolean {
  const parts = parseTimeValue(value);
  return Boolean(parts)
    && (!options.minuteStep || Boolean(parts && parts.minute % options.minuteStep === 0))
    && (!options.minTime || value >= options.minTime)
    && (!options.maxTime || value <= options.maxTime);
}

export function isLocalDateTimeInBounds(
  value: LocalDateTimeValue,
  minValue?: LocalDateTimeValue,
  maxValue?: LocalDateTimeValue
): boolean {
  return (!minValue || compareLocalDateTimeValues(value, minValue) >= 0)
    && (!maxValue || compareLocalDateTimeValues(value, maxValue) <= 0);
}
