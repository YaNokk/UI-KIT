import { describe, expect, it } from "vitest";
import { equalDateRanges, equalDateTimeRanges } from "./dateComparison";

describe("date range semantic equality", () => {
  it("compares date range boundaries by value", () => {
    expect(equalDateRanges(
      { from: "2026-08-11", to: "2026-08-22" },
      { from: "2026-08-11", to: "2026-08-22" }
    )).toBe(true);
    expect(equalDateRanges(
      { from: "2026-08-12", to: "2026-08-22" },
      { from: "2026-08-11", to: "2026-08-22" }
    )).toBe(false);
    expect(equalDateRanges(
      { from: "2026-08-11", to: "2026-08-23" },
      { from: "2026-08-11", to: "2026-08-22" }
    )).toBe(false);
    expect(equalDateRanges({ from: null, to: null }, { from: null, to: null })).toBe(true);
    expect(equalDateRanges({ from: null, to: "2026-08-22" }, { from: null, to: null })).toBe(false);
  });

  it("compares date-time range boundaries including time", () => {
    expect(equalDateTimeRanges(
      { from: "2026-08-11T09:00", to: "2026-08-22T18:30" },
      { from: "2026-08-11T09:00", to: "2026-08-22T18:30" }
    )).toBe(true);
    expect(equalDateTimeRanges(
      { from: "2026-08-11T09:00", to: "2026-08-22T18:31" },
      { from: "2026-08-11T09:00", to: "2026-08-22T18:30" }
    )).toBe(false);
  });
});
