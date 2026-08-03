import { describe, expect, it } from "vitest";
import { createStandardDateRangePresets } from "./datePresets";

describe("createStandardDateRangePresets", () => {
  it("resolves current periods as full periods by default", () => {
    const preset = createStandardDateRangePresets().find(({ id }) => id === "this-week");
    expect(preset?.resolve({ now: new Date(2026, 7, 3, 12), locale: "ru-RU", weekStartsOn: 1 })).toEqual({
      from: "2026-08-03",
      to: "2026-08-09"
    });
  });

  it("keeps elapsed mode as an explicit option", () => {
    const preset = createStandardDateRangePresets({ currentPeriodMode: "elapsed" })
      .find(({ id }) => id === "this-week");
    expect(preset?.resolve({ now: new Date(2026, 7, 3, 12), locale: "ru-RU", weekStartsOn: 1 })).toEqual({
      from: "2026-08-03",
      to: "2026-08-03"
    });
  });
});
