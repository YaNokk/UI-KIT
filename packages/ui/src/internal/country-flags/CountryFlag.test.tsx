// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CountryFlag } from "./CountryFlag";

afterEach(cleanup);

describe("CountryFlag", () => {
  it("renders a decorative local SVG asset without emoji text", () => {
    const { container } = render(<CountryFlag country="RU" size="md" />);
    const root = container.querySelector("[data-country-flag='RU']");
    const svg = root?.querySelector("svg");

    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveAttribute("data-country-flag-asset");
    expect(root).toHaveTextContent("");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg?.querySelector("use")?.getAttribute("href")).toMatch(
      /country-flags\.sprite\.svg#flag-RU$/
    );
  });

  it("uses a neutral SVG fallback for an unknown country", () => {
    const { container } = render(<CountryFlag country="ZZ" />);
    expect(container.querySelector("[data-country-flag='ZZ']"))
      .toHaveAttribute("data-country-flag-fallback");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
