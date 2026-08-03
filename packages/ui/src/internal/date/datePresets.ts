import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subQuarters,
  subWeeks,
  subYears
} from "date-fns";
import { serializeDateValue } from "./serializeDateValue";
import type {
  CurrentPeriodMode,
  DateRangePreset,
  DateRangePresetContext,
  DateRangeValue
} from "./types";
import { resolveDateMessages } from "./resolveDateMessages";

function range(from: Date, to: Date): DateRangeValue {
  return { from: serializeDateValue(from), to: serializeDateValue(to) };
}

function createPreset(
  id: string,
  label: string,
  resolve: (context: DateRangePresetContext) => DateRangeValue
): DateRangePreset {
  return { id, label, resolve };
}

export function createStandardDateRangePresets(options?: {
  locale?: string;
  currentPeriodMode?: CurrentPeriodMode;
  includeAllTime?: boolean;
}): DateRangePreset[] {
  const localized = resolveDateMessages(options?.locale ?? "ru-RU");
  const mode = options?.currentPeriodMode ?? "elapsed";
  const currentEnd = (full: Date, now: Date) => mode === "full" ? full : now;
  const presets: DateRangePreset[] = [
    createPreset("today", localized.today, ({ now }) => range(now, now)),
    createPreset("yesterday", localized.yesterday, ({ now }) => {
      const date = subDays(now, 1); return range(date, date);
    }),
    createPreset("this-week", localized.thisWeek, ({ now, weekStartsOn }) =>
      range(startOfWeek(now, { weekStartsOn }), currentEnd(endOfWeek(now, { weekStartsOn }), now))),
    createPreset("previous-week", localized.previousWeek, ({ now, weekStartsOn }) => {
      const date = subWeeks(now, 1);
      return range(startOfWeek(date, { weekStartsOn }), endOfWeek(date, { weekStartsOn }));
    }),
    createPreset("last-7-days", localized.last7Days, ({ now }) => range(subDays(now, 6), now)),
    createPreset("last-30-days", localized.last30Days, ({ now }) => range(subDays(now, 29), now)),
    createPreset("this-month", localized.thisMonth, ({ now }) =>
      range(startOfMonth(now), currentEnd(endOfMonth(now), now))),
    createPreset("previous-month", localized.previousMonthPreset, ({ now }) => {
      const date = subMonths(now, 1); return range(startOfMonth(date), endOfMonth(date));
    }),
    createPreset("this-quarter", localized.thisQuarter, ({ now }) =>
      range(startOfQuarter(now), currentEnd(endOfQuarter(now), now))),
    createPreset("previous-quarter", localized.previousQuarter, ({ now }) => {
      const date = subQuarters(now, 1); return range(startOfQuarter(date), endOfQuarter(date));
    }),
    createPreset("this-year", localized.thisYear, ({ now }) =>
      range(startOfYear(now), currentEnd(endOfYear(now), now))),
    createPreset("previous-year", localized.previousYear, ({ now }) => {
      const date = subYears(now, 1); return range(startOfYear(date), endOfYear(date));
    })
  ];
  if (options?.includeAllTime) {
    presets.push(createPreset("all-time", localized.allTime, ({ minDate, maxDate }) => ({
      from: minDate ?? null,
      to: maxDate ?? null
    })));
  }
  return presets;
}
