import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { serializeDateValue } from "./serializeDateValue";
import type { DateValue, WeekStartsOn } from "./types";

export interface CalendarCell {
  value: DateValue;
  outside: boolean;
}

export function createCalendarGrid(month: Date, weekStartsOn: WeekStartsOn): CalendarCell[] {
  const interval = {
    start: startOfWeek(startOfMonth(month), { weekStartsOn }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn })
  };
  return eachDayOfInterval(interval).map((date) => ({
    value: serializeDateValue(date),
    outside: !isSameMonth(date, month)
  }));
}
