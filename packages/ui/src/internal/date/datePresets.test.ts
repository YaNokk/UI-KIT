import { afterEach, describe, expect, it, vi } from "vitest";
import { createStandardDateRangePresets } from "./datePresets";

describe("createStandardDateRangePresets", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps Today distinct from the full Monday-start week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T12:00:00"));
    const presets = createStandardDateRangePresets();
    const context = { now: new Date(), locale: "ru-RU", weekStartsOn: 1 as const };
    expect(presets.find(({ id }) => id === "today")?.resolve(context)).toEqual({
      from: "2026-08-03",
      to: "2026-08-03"
    });
    expect(presets.find(({ id }) => id === "this-week")?.resolve(context)).toEqual({
      from: "2026-08-03",
      to: "2026-08-09"
    });
  });

  it("keeps elapsed mode as an explicit option", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T12:00:00"));
    const preset = createStandardDateRangePresets({ currentPeriodMode: "elapsed" })
      .find(({ id }) => id === "this-week");
    expect(preset?.resolve({ now: new Date(), locale: "ru-RU", weekStartsOn: 1 })).toEqual({
      from: "2026-08-03",
      to: "2026-08-03"
    });
  });

  it("resolves a Sunday-start week deterministically", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T12:00:00"));
    const preset = createStandardDateRangePresets().find(({ id }) => id === "this-week");
    expect(preset?.resolve({ now: new Date(), locale: "en-US", weekStartsOn: 0 })).toEqual({
      from: "2026-08-02",
      to: "2026-08-08"
    });
  });
});
