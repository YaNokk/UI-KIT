// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { scrollbarClassName } from "./scrollbar";

const css = readFileSync(
  resolve(process.cwd(), "packages", "ui", "src", "styles", "scrollbar.css"),
  "utf8"
);

describe("scrollbar visual contract", () => {
  it("returns the canonical opt-in classes", () => {
    expect(scrollbarClassName()).toBe("ds-scrollbar");
    expect(scrollbarClassName("compact")).toBe("ds-scrollbar-compact");
  });

  it("supports Firefox and WebKit without taking scroll ownership", () => {
    expect(css).toContain("scrollbar-width: thin");
    expect(css).toContain("scrollbar-color:");
    expect(css).toContain("::-webkit-scrollbar");
    expect(css).toContain("::-webkit-scrollbar-track");
    expect(css).toContain("::-webkit-scrollbar-thumb");
    expect(css).toContain("::-webkit-scrollbar-button");
    expect(css).not.toMatch(/\boverflow(?:-[xy])?\s*:/u);
    expect(css).not.toMatch(/(^|,)\s*\*\s*(?:,|\{)/mu);
  });

  it("uses only semantic colors and canonical geometry tokens", () => {
    expect(css).toContain("var(--ds-scrollbar-thumb)");
    expect(css).toContain("var(--ds-scrollbar-thumb-hover)");
    expect(css).toContain("var(--ds-size-scrollbar-default)");
    expect(css).toContain("var(--ds-size-scrollbar-compact)");
    expect(css).toContain("var(--ds-radius-full)");
    expect(css).not.toMatch(/#[\da-f]{3,8}\b/iu);
    expect(css).not.toContain("999px");
  });
});

