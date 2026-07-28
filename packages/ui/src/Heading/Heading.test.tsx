// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { Heading } from "./Heading";

afterEach(cleanup);

describe("Heading", () => {
  it("keeps semantic level independent from visual variant", () => {
    render(
      <>
        <Heading level={2} variant="page">Раздел</Heading>
        <Heading level={3} variant="sm">Подраздел</Heading>
      </>
    );

    expect(screen.getByRole("heading", { level: 2, name: "Раздел" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Подраздел" })).toBeInTheDocument();
  });

  it("has no detectable axe violations for a valid hierarchy", async () => {
    const { container } = render(
      <main>
        <Heading level={1} variant="page">Заказы</Heading>
        <Heading level={2} variant="md">Новые</Heading>
      </main>
    );

    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
