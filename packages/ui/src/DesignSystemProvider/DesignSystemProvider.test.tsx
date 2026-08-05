// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBrandCssVariables } from "@mypoint/tokens";
import { Amount } from "../Amount/Amount";
import { AmountInput } from "../AmountInput/AmountInput";
import { Portal } from "../Portal/Portal";
import { DesignSystemProvider } from "./DesignSystemProvider";

// eslint-disable-next-line design-system/no-design-literals -- Runtime brand test fixture.
const greenBrand = { accentColor: "#16a34a" };
// eslint-disable-next-line design-system/no-design-literals -- Nested runtime brand test fixture.
const purpleBrand = { accentColor: "#7c3aed" };

function installMatchMedia(matches = false) {
  let currentMatches = matches;
  const listeners = new Set<() => void>();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      addEventListener: (_type: string, listener: () => void) => {
        listeners.add(listener);
      },
      get matches() {
        return currentMatches;
      },
      media: "(prefers-color-scheme: dark)",
      removeEventListener: (_type: string, listener: () => void) => {
        listeners.delete(listener);
      }
    }))
  });

  return {
    setMatches(nextMatches: boolean) {
      currentMatches = nextMatches;
      act(() => listeners.forEach((listener) => listener()));
    }
  };
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

  it.each(["light", "dark"] as const)(
    "synchronizes the initial %s theme to an external portal root",
    (mode) => {
      const target = document.createElement("div");
      const expectedVariables = createBrandCssVariables(greenBrand, mode);
      const { unmount } = render(
        <DesignSystemProvider
          brand={greenBrand}
          mode={mode}
          portalContainer={target}
        >
          Content
        </DesignSystemProvider>
      );

      expect(target).toHaveAttribute("data-brand-theme", "");
      expect(target).toHaveAttribute("data-theme", mode);
      for (const [name, value] of Object.entries(expectedVariables)) {
        expect(target.style.getPropertyValue(name)).toBe(value);
      }
      unmount();
    }
  );

  it("updates external portal brand and explicit mode at runtime", () => {
    const target = document.createElement("div");
    const { rerender } = render(
      <DesignSystemProvider
        brand={greenBrand}
        mode="light"
        portalContainer={target}
      >
        Content
      </DesignSystemProvider>
    );

    rerender(
      <DesignSystemProvider
        brand={purpleBrand}
        mode="dark"
        portalContainer={target}
      >
        Content
      </DesignSystemProvider>
    );

    const expectedVariables = createBrandCssVariables(purpleBrand, "dark");
    expect(target).toHaveAttribute("data-theme", "dark");
    expect(target.style.getPropertyValue("--ds-brand-accent")).toBe(
      expectedVariables["--ds-brand-accent"]
    );
    expect(target.style.getPropertyValue("--ds-brand-accent-soft")).toBe(
      expectedVariables["--ds-brand-accent-soft"]
    );
  });

  it("updates an external portal when the system preference changes", () => {
    const system = installMatchMedia(false);
    const target = document.createElement("div");
    render(
      <DesignSystemProvider mode="system" portalContainer={target}>
        Content
      </DesignSystemProvider>
    );

    expect(target).toHaveAttribute("data-theme", "light");
    system.setMatches(true);
    expect(target).toHaveAttribute("data-theme", "dark");
  });

  it("cleans the old root when portalContainer is replaced", () => {
    const firstRoot = document.createElement("div");
    const secondRoot = document.createElement("div");
    const { rerender } = render(
      <DesignSystemProvider
        brand={greenBrand}
        mode="dark"
        portalContainer={firstRoot}
      >
        Content
      </DesignSystemProvider>
    );

    rerender(
      <DesignSystemProvider
        brand={greenBrand}
        mode="dark"
        portalContainer={secondRoot}
      >
        Content
      </DesignSystemProvider>
    );

    expect(firstRoot).not.toHaveAttribute("data-brand-theme");
    expect(firstRoot).not.toHaveAttribute("data-theme");
    expect(firstRoot.style.getPropertyValue("--ds-brand-accent")).toBe("");
    expect(secondRoot).toHaveAttribute("data-brand-theme", "");
    expect(secondRoot).toHaveAttribute("data-theme", "dark");
  });

  it("cleans synchronized state from the external root on unmount", () => {
    const target = document.createElement("div");
    const { unmount } = render(
      <DesignSystemProvider
        brand={greenBrand}
        mode="light"
        portalContainer={target}
      >
        Content
      </DesignSystemProvider>
    );

    unmount();

    expect(target).not.toHaveAttribute("data-brand-theme");
    expect(target).not.toHaveAttribute("data-theme");
    expect(target.style.getPropertyValue("--ds-brand-accent")).toBe("");
  });

  it("uses its own scoped portal host by default", () => {
    render(
      <DesignSystemProvider
        brand={greenBrand}
        data-testid="provider"
        mode="dark"
      >
        <Portal><span data-testid="scoped-portal">Overlay</span></Portal>
      </DesignSystemProvider>
    );

    const provider = screen.getByTestId("provider");
    const content = screen.getByTestId("scoped-portal");
    expect(content.parentElement).toHaveAttribute("data-ds-portal-root");
    expect(content.parentElement).not.toHaveAttribute("data-theme");
    expect(provider).toContainElement(content.parentElement);
    expect(content.closest("[data-theme='dark']")).toBe(provider);
  });

  it("gives nested providers independent portal hosts", () => {
    render(
      <DesignSystemProvider
        brand={greenBrand}
        data-testid="outer-provider"
        mode="light"
      >
        <Portal><span data-testid="outer-portal">Outer overlay</span></Portal>
        <DesignSystemProvider
          brand={purpleBrand}
          data-testid="inner-provider"
        >
          <Portal><span data-testid="inner-portal">Inner overlay</span></Portal>
        </DesignSystemProvider>
      </DesignSystemProvider>
    );

    const outer = screen.getByTestId("outer-provider");
    const inner = screen.getByTestId("inner-provider");
    const outerPortal = screen.getByTestId("outer-portal");
    const innerPortal = screen.getByTestId("inner-portal");
    expect(outerPortal.parentElement).toHaveAttribute("data-ds-portal-root");
    expect(innerPortal.parentElement).toHaveAttribute("data-ds-portal-root");
    expect(outer).toContainElement(outerPortal);
    expect(inner).not.toContainElement(outerPortal);
    expect(inner).toContainElement(innerPortal);
  });

  it("treats null as an explicit reset to document.body", () => {
    render(
      <DesignSystemProvider mode="light" portalContainer={null}>
        <Portal><span data-testid="reset-portal">Reset overlay</span></Portal>
      </DesignSystemProvider>
    );

    expect(screen.getByTestId("reset-portal").parentElement).toBe(document.body);
  });

  it("keeps the provider and portal path SSR-safe", () => {
    const html = renderToString(
      <DesignSystemProvider locale="ru-RU" mode="light">
        <Portal><span>Overlay</span></Portal>
        <Amount currency="KZT" value={123456} />
      </DesignSystemProvider>
    );
    expect(html).toContain("data-ds-root");
    expect(html).toContain("data-ds-portal-root");
    expect(html).toContain("1 234");
    expect(html).toContain("56");
  });
});
