// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import styles from "./Spinner.module.css";
import { Spinner } from "./Spinner";

afterEach(cleanup);

describe("Spinner visual contract", () => {
  it("uses the canonical defaults and is decorative without a label", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector("[data-spinner]");
    const graphic = container.querySelector("svg");

    expect(spinner).toHaveClass(styles.root, styles.md, styles.current);
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(spinner).not.toHaveAttribute("role");
    expect(graphic).toHaveAttribute("aria-hidden", "true");
    expect(graphic).toHaveAttribute("focusable", "false");
  });

  it("maps every approved size", () => {
    const { container } = render(
      <>
        <Spinner data-testid="sm" size="sm" />
        <Spinner data-testid="md" size="md" />
        <Spinner data-testid="lg" size="lg" />
      </>
    );

    expect(screen.getByTestId("sm")).toHaveClass(styles.sm);
    expect(screen.getByTestId("md")).toHaveClass(styles.md);
    expect(screen.getByTestId("lg")).toHaveClass(styles.lg);
    expect(container.querySelectorAll("[data-spinner]")).toHaveLength(3);
  });

  it("maps every approved semantic tone", () => {
    const tones = [
      ["current", styles.current],
      ["primary", styles.primary],
      ["secondary", styles.secondary],
      ["accent", styles.accent],
      ["danger", styles.danger],
      ["inverse", styles.inverse]
    ] as const;

    render(
      <>
        {tones.map(([tone]) => (
          <Spinner data-testid={tone} key={tone} tone={tone} />
        ))}
      </>
    );

    tones.forEach(([tone, className]) => {
      expect(screen.getByTestId(tone)).toHaveClass(className);
    });
  });

  it("forwards className, native attributes and ref", () => {
    const ref = { current: null as HTMLSpanElement | null };

    render(
      <Spinner
        className="consumer-class"
        data-testid="spinner"
        ref={ref}
      />
    );

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toHaveClass("consumer-class");
    expect(ref.current).toBe(spinner);
  });
});

describe("Spinner accessibility", () => {
  it("announces a standalone labeled status while keeping SVG decorative", () => {
    const { container } = render(<Spinner label="Загрузка заказов" />);
    const status = screen.getByRole("status");

    expect(status).toHaveTextContent("Загрузка заказов");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).not.toHaveAttribute("aria-hidden");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("has no detectable axe violations in decorative and labeled modes", async () => {
    const { container } = render(
      <div>
        <Spinner />
        <Spinner label="Обновление данных" tone="accent" />
      </div>
    );

    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
