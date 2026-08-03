import { isExists } from "date-fns";
import type { DateParts, DateValue } from "./types";

const DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateValue(value: string): DateParts | null {
  const match = DATE_VALUE_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isExists(year, month - 1, day)) return null;
  const parts = { year, month, day };
  return serializeDateParts(parts) === value ? parts : null;
}

export function serializeDateParts(parts: DateParts): DateValue {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}` as DateValue;
}
