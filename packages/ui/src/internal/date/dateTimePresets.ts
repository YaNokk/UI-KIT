import { subHours } from "date-fns";
import { createStandardDateRangePresets } from "./datePresets";
import { zonedNow, serializeZonedDateTime } from "./timezone";
import type {
  CurrentPeriodMode,
  DateTimeRangePreset,
  DateTimeRangePresetContext,
  DateTimeRangeValue
} from "./types";

export function createStandardDateTimeRangePresets(options?: {
  locale?: string;
  currentPeriodMode?: CurrentPeriodMode;
  includeAllTime?: boolean;
}): DateTimeRangePreset[] {
  const locale = options?.locale ?? "ru-RU";
  const datePresets = createStandardDateRangePresets(options);
  const converted = datePresets.map<DateTimeRangePreset>((preset) => ({
    id: preset.id,
    label: preset.label,
    resolve: (context) => {
      if (preset.id === "all-time") {
        return { from: context.minValue ?? null, to: context.maxValue ?? null };
      }
      const now = zonedNow(context.now, context.timeZone);
      const dates = preset.resolve({
        now,
        locale: context.locale,
        weekStartsOn: context.weekStartsOn,
        minDate: context.minValue?.slice(0, 10) as never,
        maxDate: context.maxValue?.slice(0, 10) as never
      });
      return {
        from: dates.from ? `${dates.from}T00:00` : null,
        to: dates.to ? `${dates.to}T23:59` : null
      } as DateTimeRangeValue;
    }
  }));
  converted.splice(6, 0, {
    id: "last-24-hours",
    label: locale.toLowerCase().startsWith("ru") ? "Последние 24 часа" : "Last 24 hours",
    resolve: (context: DateTimeRangePresetContext) => {
      const now = zonedNow(context.now, context.timeZone);
      return {
        from: serializeZonedDateTime(subHours(now, 24)),
        to: serializeZonedDateTime(now)
      };
    }
  });
  return converted;
}
