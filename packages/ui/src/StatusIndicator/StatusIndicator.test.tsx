// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import styles from "./StatusIndicator.module.css";
import { StatusIndicator } from "./StatusIndicator";

afterEach(cleanup);

describe("StatusIndicator", () => {
  it("is decorative by default", () => {
    const { container } = render(<StatusIndicator />);
    const indicator = container.querySelector("[data-status-indicator]");

    expect(indicator).toHaveAttribute("aria-hidden", "true");
    expect(indicator).not.toHaveAttribute("role");
    expect(indicator).toHaveClass(styles.sm);
  });

  it("exposes an accessible image when labeled", () => {
    render(<StatusIndicator label="Сервис доступен" size="md" />);

    expect(screen.getByRole("img", { name: "Сервис доступен" }))
      .toHaveClass(styles.md);
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(
      <div>
        <StatusIndicator color="green" />
        <StatusIndicator color="red" label="Ошибка" />
      </div>
    );

    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
