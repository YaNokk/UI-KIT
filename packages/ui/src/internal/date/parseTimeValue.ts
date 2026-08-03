import type { TimeParts, TimeValue } from "./types";

const TIME_VALUE_PATTERN = /^(\d{2}):(\d{2})$/;

export function parseTimeValue(value: string): TimeParts | null {
  const match = TIME_VALUE_PATTERN.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export function serializeTimeParts(parts: TimeParts): TimeValue {
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}` as TimeValue;
}
