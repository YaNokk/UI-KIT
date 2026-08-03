import type { DateValue } from "./types";

export function serializeDateValue(date: Date): DateValue {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` as DateValue;
}
