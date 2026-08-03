import type { ReactNode } from "react";

export type DateValue = `${number}-${number}-${number}`;
export type TimeValue = `${number}:${number}`;
export type LocalDateTimeValue = `${number}-${number}-${number}T${number}:${number}`;

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

export interface TimeParts {
  hour: number;
  minute: number;
}

export interface LocalDateTimeParts extends DateParts, TimeParts {}

export interface DateRangeValue {
  from: DateValue | null;
  to: DateValue | null;
}

export interface DateTimeRangeValue {
  from: LocalDateTimeValue | null;
  to: LocalDateTimeValue | null;
}

export type WeekStartsOn = 0 | 1 | 6;
export type CurrentPeriodMode = "elapsed" | "full";

export interface DateRangePresetContext {
  now: Date;
  locale: string;
  weekStartsOn: WeekStartsOn;
  minDate?: DateValue | undefined;
  maxDate?: DateValue | undefined;
}

export interface DateRangePreset {
  id: string;
  label: ReactNode;
  resolve: (context: DateRangePresetContext) => DateRangeValue;
}

export interface DateTimeRangePresetContext {
  now: Date;
  locale: string;
  timeZone: string;
  weekStartsOn: WeekStartsOn;
  minValue?: LocalDateTimeValue | undefined;
  maxValue?: LocalDateTimeValue | undefined;
}

export interface DateTimeRangePreset {
  id: string;
  label: ReactNode;
  resolve: (context: DateTimeRangePresetContext) => DateTimeRangeValue;
}
