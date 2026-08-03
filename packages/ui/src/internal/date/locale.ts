import type { WeekStartsOn } from "./types";

export function resolveWeekStartsOn(locale: string, explicit?: WeekStartsOn): WeekStartsOn {
  if (explicit !== undefined) return explicit;
  try {
    const firstDay = (new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number };
    }).weekInfo?.firstDay;
    if (firstDay === 7) return 0;
    if (firstDay === 6) return 6;
  } catch {
    // Invalid locales are normalized by the shared locale boundary.
  }
  return 1;
}
