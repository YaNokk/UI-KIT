import { describe, expect, it } from "vitest";
import { formatDateRangeValue, formatDateTimeRangeValue } from "./formatDateRangeValue";
import { parseLocalizedDateRange, parseLocalizedDateTimeRange } from "./parseLocalizedDateRange";

describe("single-field range formatting", () => {
  it("round-trips date ranges in Russian and English locales", () => {
    const value = { from: "2026-08-02", to: "2026-08-09" } as const;
    expect(formatDateRangeValue(value, "ru-RU")).toBe("02.08.2026 — 09.08.2026");
    expect(parseLocalizedDateRange("02.08.2026 - 09.08.2026", "ru-RU")).toEqual(value);
    expect(parseLocalizedDateRange("08/02/2026 — 08/09/2026", "en-US")).toEqual(value);
  });

  it("round-trips date-time ranges and rejects partial input", () => {
    const value = { from: "2026-08-02T18:30", to: "2026-08-03T19:45" } as const;
    expect(formatDateTimeRangeValue(value, "ru-RU")).toBe(
      "02.08.2026, 18:30 — 03.08.2026, 19:45"
    );
    expect(parseLocalizedDateTimeRange("02.08.2026, 18:30 — 03.08.2026, 19:45", "ru-RU")).toEqual(value);
    expect(parseLocalizedDateTimeRange("02.08.2026, 18:30 — 03", "ru-RU")).toBeNull();
  });
});
