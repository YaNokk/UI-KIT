import { parseDateValue } from "./parseDateValue";
import { parseTimeValue } from "./parseTimeValue";
import type { LocalDateTimeParts, LocalDateTimeValue } from "./types";

export function parseLocalDateTimeValue(value: string): LocalDateTimeParts | null {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const dateText = match[1];
  const timeText = match[2];
  if (!dateText || !timeText) return null;
  const date = parseDateValue(dateText);
  const time = parseTimeValue(timeText);
  return date && time ? { ...date, ...time } : null;
}

export function joinLocalDateTime(
  date: string | null,
  time: string | null
): LocalDateTimeValue | null {
  if (!date || !time || !parseDateValue(date) || !parseTimeValue(time)) return null;
  return `${date}T${time}` as LocalDateTimeValue;
}
