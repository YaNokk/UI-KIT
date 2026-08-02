import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, resolveLocale } from "./resolveLocale";

describe("resolveLocale", () => {
  it("uses explicit, configured and deterministic fallback locales in order", () => {
    expect(resolveLocale("pl-PL", "de-DE")).toBe("pl-PL");
    expect(resolveLocale(undefined, "de-DE")).toBe("de-DE");
    expect(resolveLocale()).toBe(DEFAULT_LOCALE);
    expect(DEFAULT_LOCALE).toBe("ru-RU");
  });
});
