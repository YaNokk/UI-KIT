// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { Text } from "./Text";

afterEach(cleanup);

describe("Text", () => {
  it("uses the documented defaults and forwards its ref", () => {
    const ref = { current: null as HTMLElement | null };

    render(<Text ref={ref}>Основной текст</Text>);

    const text = screen.getByText("Основной текст");
    expect(text.tagName).toBe("SPAN");
    expect(ref.current).toBe(text);
  });

  it("renders intentional semantic elements", () => {
    render(
      <>
        <Text as="p">Абзац</Text>
        <Text as="label" htmlFor="name">Название</Text>
        <input id="name" />
      </>
    );

    expect(screen.getByText("Абзац").tagName).toBe("P");
    expect(screen.getByText("Название").tagName).toBe("LABEL");
    expect(screen.getByLabelText("Название")).toBeInTheDocument();
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(
      <div>
        <Text>Основной</Text>
        <Text tone="secondary" variant="bodySm">Дополнительный</Text>
        <Text tone="danger">Ошибка</Text>
      </div>
    );

    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
