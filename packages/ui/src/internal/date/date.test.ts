import { addHours, differenceInHours } from "date-fns";
import { describe, expect, it } from "vitest";
import { createCalendarGrid } from "./calendarGrid";
import { parseLocalizedDate, formatDateValue } from "./dateFormatting";
import { createStandardDateRangePresets } from "./datePresets";
import { createStandardDateTimeRangePresets } from "./dateTimePresets";
import { validateDateTimeRange } from "./dateTimeRange";
import { parseDateValue, serializeDateParts } from "./parseDateValue";
import { parseLocalDateTimeValue } from "./parseLocalDateTimeValue";
import { parseTimeValue } from "./parseTimeValue";
import { selectRangeDate } from "./dateRange";
import { zonedNow } from "./timezone";

describe("date adapter", () => {
  it("strictly parses and round-trips canonical values", () => {
    expect(parseDateValue("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
    expect(serializeDateParts({ year: 2024, month: 2, day: 29 })).toBe("2024-02-29");
    for (const value of ["2026-2-01", "2026-02-30", "2026-13-01", "2026-00-10", "not-a-date"]) {
      expect(parseDateValue(value)).toBeNull();
    }
    expect(parseTimeValue("23:59")).toEqual({ hour: 23, minute: 59 });
    expect(parseTimeValue("24:00")).toBeNull();
    expect(parseLocalDateTimeValue("2026-08-02T10:15")).not.toBeNull();
  });

  it("parses localized text without Date.parse", () => {
    expect(parseLocalizedDate("02.08.2026", "ru-RU")).toBe("2026-08-02");
    expect(parseLocalizedDate("08/02/2026", "en-US")).toBe("2026-08-02");
    expect(formatDateValue("2026-08-02", "ru-RU")).toBe("02.08.2026");
  });

  it("builds complete week-aligned grids", () => {
    const cells = createCalendarGrid(new Date(2026, 7, 1), 1);
    expect(cells.length % 7).toBe(0);
    expect(cells[0]?.value).toBe("2026-07-27");
  });

  it("normalizes reversed date boundaries", () => {
    const start = selectRangeDate({ from: null, to: null }, "2026-08-10");
    expect(selectRangeDate(start.value, "2026-08-02").value).toEqual({
      from: "2026-08-02",
      to: "2026-08-10"
    });
  });

  it("resolves rolling and calendar presets deterministically", () => {
    const context = {
      now: new Date(2026, 7, 2, 12),
      locale: "ru-RU",
      weekStartsOn: 1 as const
    };
    const presets = createStandardDateRangePresets({ locale: "ru-RU" });
    expect(presets.find((preset) => preset.id === "last-7-days")?.resolve(context)).toEqual({
      from: "2026-07-27",
      to: "2026-08-02"
    });
    expect(presets.find((preset) => preset.id === "this-month")?.resolve(context)).toEqual({
      from: "2026-08-01",
      to: "2026-08-31"
    });
  });

  it("uses timezone-aware instants across DST", () => {
    const before = zonedNow(new Date("2026-03-29T00:30:00Z"), "Europe/Berlin");
    const after = addHours(before, 2);
    expect(differenceInHours(after, before)).toBe(2);
    expect(validateDateTimeRange({
      from: "2026-03-29T01:30",
      to: "2026-03-29T04:30"
    }, { hours: 2 }, "Europe/Berlin")).toBe(true);
    const preset = createStandardDateTimeRangePresets({ locale: "en-US" })
      .find((item) => item.id === "last-24-hours");
    expect(preset?.resolve({
      now: new Date("2026-03-29T12:00:00Z"),
      locale: "en-US",
      timeZone: "Europe/Berlin",
      weekStartsOn: 1
    }).to).toBe("2026-03-29T14:00");
    expect(() => zonedNow(new Date(), "Invalid/Zone")).toThrow(RangeError);
  });
});
