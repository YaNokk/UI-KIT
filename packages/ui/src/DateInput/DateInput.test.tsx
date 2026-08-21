// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateInput } from "./DateInput";

afterEach(cleanup);

describe("DateInput", () => {
  it("forwards its ref to the focusable input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<DateInput aria-label="Дата" ref={ref} />);
    const input = screen.getByRole("textbox", { name: "Дата" });

    expect(ref.current).toBe(input);
    ref.current?.focus();
    expect(input).toHaveFocus();
  });

  it("keeps partial text local and emits only a complete canonical date", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateInput aria-label="Дата" locale="ru-RU" onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Дата" });
    await user.type(input, "02.08");
    expect(onChange).not.toHaveBeenCalled();
    await user.type(input, ".2026");
    expect(onChange).toHaveBeenLastCalledWith("2026-08-02");
  });

  it("restores the last valid value on blur", async () => {
    const user = userEvent.setup();
    render(<DateInput aria-label="Дата" defaultValue="2026-08-02" locale="ru-RU" />);
    const input = screen.getByRole("textbox", { name: "Дата" });
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}31.02.2026");
    fireEvent.blur(input);
    expect(input).toHaveValue("02.08.2026");
  });

  it("normalizes a pasted alternate separator through Maskito", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateInput aria-label="Дата" locale="ru-RU" onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Дата" });
    await user.click(input);
    await user.paste("02/08/2026");
    expect(input).toHaveValue("02.08.2026");
    expect(onChange).toHaveBeenLastCalledWith("2026-08-02");
  });

  it("submits canonical form data and follows native reset", async () => {
    const user = userEvent.setup();
    render(
      <form data-testid="form">
        <DateInput aria-label="Дата" defaultValue="2026-08-02" locale="ru-RU" name="createdAt" />
        <button type="reset">Reset</button>
      </form>
    );
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("createdAt")).toBe("2026-08-02");
    const input = screen.getByRole("textbox", { name: "Дата" });
    await user.clear(input);
    await user.type(input, "03.08.2026");
    expect(new FormData(form).get("createdAt")).toBe("2026-08-03");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await Promise.resolve();
    expect(input).toHaveValue("02.08.2026");
  });

  it("has no obvious accessibility violations", async () => {
    const { container } = render(<DateInput label="Дата" hint="ДД.ММ.ГГГГ" />);
    expect((await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    })).violations).toEqual([]);
  });
});
