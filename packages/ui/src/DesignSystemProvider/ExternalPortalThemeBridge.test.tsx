// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CSSProperties } from "react";
import {
  ResolvedThemeContext,
  type ResolvedThemeSnapshot
} from "../theme/ResolvedThemeContext";
import { ExternalPortalThemeBridge } from "./ExternalPortalThemeBridge";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function snapshot(
  variables: Record<string, string>,
  mode: ResolvedThemeSnapshot["mode"] = "light"
): ResolvedThemeSnapshot {
  return { mode, variables: variables as CSSProperties };
}

function BridgeFixture({
  container,
  value
}: {
  container: HTMLElement;
  value: ResolvedThemeSnapshot;
}) {
  return (
    <ResolvedThemeContext.Provider value={value}>
      <ExternalPortalThemeBridge container={container} />
    </ResolvedThemeContext.Provider>
  );
}

describe("ExternalPortalThemeBridge", () => {
  it("removes variable names that disappear from the resolved snapshot", () => {
    const container = document.createElement("div");
    const { rerender } = render(
      <BridgeFixture
        container={container}
        value={snapshot({
          "--ds-brand-accent": "first",
          "--ds-brand-special": "stale"
        })}
      />
    );

    rerender(
      <BridgeFixture
        container={container}
        value={snapshot({ "--ds-brand-accent": "second" }, "dark")}
      />
    );

    expect(container).toHaveAttribute("data-theme", "dark");
    expect(container.style.getPropertyValue("--ds-brand-accent")).toBe("second");
    expect(container.style.getPropertyValue("--ds-brand-special")).toBe("");
  });

  it("warns and prevents a second provider from owning the same root", () => {
    const container = document.createElement("div");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(
      <>
        <BridgeFixture
          container={container}
          value={snapshot({ "--ds-brand-accent": "first" })}
        />
        <BridgeFixture
          container={container}
          value={snapshot({ "--ds-brand-accent": "second" }, "dark")}
        />
      </>
    );

    expect(warn).toHaveBeenCalledWith(
      "The supplied portalContainer is already owned by another "
      + "DesignSystemProvider. Use a separate portal root for each "
      + "independent provider scope."
    );
    expect(container).toHaveAttribute("data-theme", "light");
    expect(container.style.getPropertyValue("--ds-brand-accent")).toBe("first");
  });
});
