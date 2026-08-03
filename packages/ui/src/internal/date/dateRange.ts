import { compareDateValues } from "./dateComparison";
import { dateDurationDays } from "./dateMath";
import type { DateRangeValue, DateValue } from "./types";

export type RangeSelectionPhase = "idle" | "selecting-start" | "selecting-end" | "complete";

export function selectRangeDate(
  current: DateRangeValue,
  selected: DateValue
): { value: DateRangeValue; phase: RangeSelectionPhase } {
  if (!current.from || current.to) {
    return { value: { from: selected, to: null }, phase: "selecting-end" };
  }
  return compareDateValues(selected, current.from) < 0
    ? { value: { from: selected, to: current.from }, phase: "complete" }
    : { value: { from: current.from, to: selected }, phase: "complete" };
}

export function isDateRangeComplete(value: DateRangeValue): boolean {
  return value.from != null && value.to != null;
}

export function isEmptyDateRange(value: DateRangeValue): boolean {
  return value.from === null && value.to === null;
}

export function isDateRangeDurationValid(
  value: DateRangeValue,
  maxDuration?: { days?: number }
): boolean {
  if (!value.from || !value.to || !maxDuration?.days) return true;
  return dateDurationDays(value.from, value.to) <= maxDuration.days;
}
