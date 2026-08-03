import { describe, expect, it } from "vitest";
import { clampCalendarMonth } from "./clampCalendarMonth";

describe("clampCalendarMonth", () => {
  it("normalizes to a month and clamps both bounds", () => {
    expect(clampCalendarMonth(new Date(2026, 5, 18), "2026-07-10", "2026-09-20"))
      .toEqual(new Date(2026, 6, 1));
    expect(clampCalendarMonth(new Date(2026, 7, 18), "2026-07-10", "2026-09-20"))
      .toEqual(new Date(2026, 7, 1));
    expect(clampCalendarMonth(new Date(2026, 10, 18), "2026-07-10", "2026-09-20"))
      .toEqual(new Date(2026, 8, 1));
  });
});
