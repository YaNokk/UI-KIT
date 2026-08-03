// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { DateTimeInput } from "./DateTimeInput";

afterEach(cleanup);

describe("DateTimeInput", () => {
  it("uses one physical input and emits a complete canonical value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<DateTimeInput aria-label="Дата и время" locale="ru-RU" onChange={onChange} />);
    expect(container.querySelectorAll("input:not([type='hidden'])")).toHaveLength(1);
    await user.type(screen.getByRole("textbox", { name: "Дата и время" }), "020820260930");
    expect(onChange).toHaveBeenLastCalledWith("2026-08-02T09:30");
  });

  it("does not emit impossible or minute-step-invalid values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimeInput aria-label="Дата и время" locale="en-US" minuteStep={15} onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Дата и время" });
    await user.type(input, "023020260910");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("normalizes localized paste and emits only the complete date-time", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimeInput aria-label="Date and time" locale="en-US" onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Date and time" });
    await user.click(input);
    await user.paste("08/02/2026, 09:30");
    expect(input).toHaveValue("08/02/2026, 09:30");
    expect(onChange).toHaveBeenLastCalledWith("2026-08-02T09:30");
  });

  it("inherits provider locale and lets an explicit locale override it", () => {
    render(
      <DesignSystemProvider locale="ru-RU" mode="light">
        <DateTimeInput aria-label="Наследуемая локаль" />
        <DateTimeInput aria-label="Явная локаль" locale="en-US" />
      </DesignSystemProvider>
    );
    expect(screen.getByRole("textbox", { name: "Наследуемая локаль" })).toHaveAttribute(
      "placeholder",
      "ДД.ММ.ГГГГ, ЧЧ:ММ"
    );
    expect(screen.getByRole("textbox", { name: "Явная локаль" })).toHaveAttribute(
      "placeholder",
      "MM/DD/YYYY, HH:mm"
    );
  });
});
