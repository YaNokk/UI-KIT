// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, type ThemePreference } from "./ThemeProvider";

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();
  const matchMedia = vi.fn().mockImplementation(() => ({
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    }
  }));
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: matchMedia
  });

  return {
    matchMedia,
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      act(() => listeners.forEach((listener) => listener()));
    }
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderTheme(mode: ThemePreference) {
  render(
    <ThemeProvider data-testid="theme" mode={mode}>
      Theme
    </ThemeProvider>
  );
  return screen.getByTestId("theme");
}

describe("ThemeProvider mode resolution", () => {
  it.each(["light", "dark"] as const)(
    "does not read or subscribe to system mode for explicit %s",
    (mode) => {
      const system = installMatchMedia(mode === "light");
      expect(renderTheme(mode)).toHaveAttribute("data-theme", mode);
      expect(system.matchMedia).not.toHaveBeenCalled();
      system.setMatches(mode !== "dark");
      expect(screen.getByTestId("theme")).toHaveAttribute("data-theme", mode);
    }
  );

  it("subscribes and responds when mode is system", () => {
    const system = installMatchMedia(false);
    expect(renderTheme("system")).toHaveAttribute("data-theme", "light");
    expect(system.matchMedia).toHaveBeenCalled();

    system.setMatches(true);
    expect(screen.getByTestId("theme")).toHaveAttribute("data-theme", "dark");
  });
});
