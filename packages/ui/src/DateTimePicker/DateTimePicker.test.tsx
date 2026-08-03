// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DesignSystemProvider } from "../DesignSystemProvider";
import { DateTimePicker } from "./DateTimePicker";

afterEach(cleanup);
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
  });
});

describe("DateTimePicker", () => {
  it("inherits provider locale and exposes localized presets", () => {
    render(
      <DesignSystemProvider locale="ru-RU">
        <DateTimePicker defaultOpen label="Дата и время" />
      </DesignSystemProvider>
    );
    expect(screen.getByRole("heading", { name: "Выберите дату и время" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Сейчас" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Дата и время" })).toHaveAttribute(
      "placeholder",
      "ДД.ММ.ГГГГ, ЧЧ:ММ"
    );
  });

  it("preserves time when selecting another date and commits only on Apply", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        defaultOpen
        defaultValue="2026-08-02T18:30"
        locale="en-US"
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole("gridcell", { name: "Wednesday, August 5, 2026" }));
    expect(screen.getByRole("textbox", { name: "Choose date and time" })).toHaveValue("08/05/2026, 18:30");
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenLastCalledWith("2026-08-05T18:30");
  });

  it("disables Apply for partial or minute-step-invalid draft text", async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        defaultOpen
        defaultValue="2026-08-02T18:30"
        locale="en-US"
        minuteStep={15}
      />
    );
    const input = screen.getByRole("textbox", { name: "Choose date and time" });
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}08");
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    await user.keyboard("{Control>}a{/Control}080220261820");
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("restores its default value on native form reset", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <DateTimePicker defaultValue="2026-08-02T18:30" label="Date and time" locale="en-US" />
        <button type="reset">Reset</button>
      </form>
    );
    const input = screen.getByRole("textbox", { name: "Date and time" });
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}080320261900");
    expect(input).toHaveValue("08/03/2026, 19:00");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await Promise.resolve();
    expect(input).toHaveValue("08/02/2026, 18:30");
  });
});
