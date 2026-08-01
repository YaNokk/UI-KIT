// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

afterEach(cleanup);

describe("Checkbox", () => {
  it("uses a native input and reports checked state before the event", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox label="Новости" name="news" onChange={onChange} value="yes" />);

    const checkbox = screen.getByRole("checkbox", { name: "Новости" });
    await user.click(screen.getByText("Новости"));

    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ type: "change" }));
    expect(checkbox).toHaveAttribute("name", "news");
    expect(checkbox).toHaveAttribute("value", "yes");
  });

  it("sets indeterminate on the native input and forwards its ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox indeterminate label="Выбрать всё" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole("checkbox", { name: "Выбрать всё" }));
    expect(ref.current?.indeterminate).toBe(true);
  });

  it("keeps the native indeterminate property aligned with an unchanged prop", async () => {
    const user = userEvent.setup();
    render(<Checkbox indeterminate label="Выбрать всё" />);
    const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name: "Выбрать всё" });
    await user.click(checkbox);
    expect(checkbox.indeterminate).toBe(true);
  });

  it("lets error replace description and preserves external description IDs", () => {
    render(
      <Checkbox
        aria-describedby="external"
        description="Подсказка"
        error="Обязательное согласие"
        id="terms"
        label="Условия"
      />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Условия" });
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-describedby", "external terms-error");
    expect(screen.queryByText("Подсказка")).not.toBeInTheDocument();
    expect(screen.getByText("Обязательное согласие")).toBeInTheDocument();
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(<Checkbox description="Письма раз в неделю" label="Новости" />);
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
