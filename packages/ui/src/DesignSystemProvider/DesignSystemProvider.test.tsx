// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Amount } from "../Amount/Amount";
import { AmountInput } from "../AmountInput/AmountInput";
import { Portal } from "../Portal/Portal";
import { DesignSystemProvider } from "./DesignSystemProvider";

// eslint-disable-next-line design-system/no-design-literals -- Runtime brand test fixture.
const greenBrand = { accentColor: "#16a34a" };

function installMatchMedia(matches = false) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      matches,
      media: "(prefers-color-scheme: dark)",
      removeEventListener: vi.fn()
    }))
  });
}

beforeEach(() => installMatchMedia());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DesignSystemProvider", () => {
  it("provides locale to Amount and AmountInput while explicit props win", () => {
    render(
      <DesignSystemProvider locale="ru-RU" mode="light">
        <Amount currency="KZT" data-testid="provider-amount" value={123456} />
        <Amount
          currency="KZT"
          data-testid="explicit-amount"
          locale="en-US"
          value={123456}
        />
        <AmountInput
          aria-label="Provider input"
          currency="KZT"
          value={123456}
        />
      </DesignSystemProvider>
    );

    expect(screen.getByTestId("provider-amount")).toHaveTextContent("1 234,56 ₸");
    expect(screen.getByTestId("explicit-amount")).toHaveTextContent("₸1,234.56");
    expect(screen.getByLabelText("Provider input")).toHaveValue("1 234,56 ₸");
  });

  it("inherits omitted nested values and scopes supplied overrides", () => {
    render(
      <DesignSystemProvider
        brand={greenBrand}
        data-testid="outer"
        locale="ru-RU"
        mode="dark"
      >
        <DesignSystemProvider data-testid="inner" locale="en-US">
          <Amount currency="KZT" data-testid="nested-amount" value={123456} />
        </DesignSystemProvider>
      </DesignSystemProvider>
    );

    const outer = screen.getByTestId("outer");
    const inner = screen.getByTestId("inner");
    expect(outer).toHaveAttribute("data-theme", "dark");
    expect(inner).toHaveAttribute("data-theme", "dark");
    // eslint-disable-next-line design-system/no-design-literals -- Resolved runtime brand assertion.
    expect(outer.style.getPropertyValue("--ds-brand-accent")).toBe("#16a34a");
    // eslint-disable-next-line design-system/no-design-literals -- Inherited runtime brand assertion.
    expect(inner.style.getPropertyValue("--ds-brand-accent")).toBe("#16a34a");
    expect(screen.getByTestId("nested-amount")).toHaveTextContent("₸1,234.56");
  });

  it("resolves system mode once at the provider layer", () => {
    installMatchMedia(true);
    render(
      <DesignSystemProvider data-testid="provider">
        <span>Dark system</span>
      </DesignSystemProvider>
    );
    expect(screen.getByTestId("provider")).toHaveAttribute("data-theme", "dark");
  });

  it("configures the existing Portal target", () => {
    const target = document.createElement("div");
    document.body.append(target);
    const { unmount } = render(
      <DesignSystemProvider mode="light" portalContainer={target}>
        <Portal><span data-testid="portal-content">Overlay</span></Portal>
      </DesignSystemProvider>
    );

    expect(target).toContainElement(screen.getByTestId("portal-content"));
    unmount();
    target.remove();
  });

  it("keeps the provider and portal path SSR-safe", () => {
    const html = renderToString(
      <DesignSystemProvider locale="ru-RU" mode="light">
        <Portal><span>Overlay</span></Portal>
        <Amount currency="KZT" value={123456} />
      </DesignSystemProvider>
    );
    expect(html).toContain("1 234");
    expect(html).toContain("56");
  });
});
