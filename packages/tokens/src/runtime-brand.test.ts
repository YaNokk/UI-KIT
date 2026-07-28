import { describe, expect, it } from "vitest";
import { resolveBrand, type ThemeMode } from "./runtime-brand";

type Rgb = readonly [number, number, number];

function parse(color: string): Rgb {
  return [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16)
  ];
}

function luminance(color: string): number {
  const channels = parse(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (channels[0] ?? 0)
    + 0.7152 * (channels[1] ?? 0)
    + 0.0722 * (channels[2] ?? 0);
}

function contrast(first: string, second: string): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

describe("resolveBrand", () => {
  const stressAccents = ["#0080ff", "#16a34a", "#7c3aed", "#facc15", "#111827"];
  const modes: ThemeMode[] = ["light", "dark"];

  it.each(modes.flatMap((mode) => stressAccents.map((accentColor) => [mode, accentColor] as const)))(
    "keeps text contrast safe in %s mode for %s",
    (mode, accentColor) => {
      const brand = resolveBrand({ accentColor }, mode);
      expect(contrast(brand.accent, brand.onAccent)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(brand.accentSoft, brand.accentSoftForeground)).toBeGreaterThanOrEqual(4.5);
    }
  );

  it("rejects an unsafe preferred foreground", () => {
    const brand = resolveBrand(
      { accentColor: "#facc15", foregroundColor: "#ffffff" },
      "light"
    );
    expect(brand.onAccent).toBe("#000000");
  });

  it("rejects invalid backend values", () => {
    expect(() => resolveBrand({ accentColor: "blue" }, "light")).toThrow(TypeError);
    expect(() =>
      resolveBrand({ accentColor: "#0080ff", foregroundColor: "white" }, "light")
    ).toThrow(TypeError);
  });
});
