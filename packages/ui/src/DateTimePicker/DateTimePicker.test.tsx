// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
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
  it("forwards its ref to the trigger input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<DateTimePicker label="Date and time" locale="en-US" ref={ref} />);
    const input = screen.getByRole("textbox", { name: "Date and time" });

    expect(ref.current).toBe(input);
    ref.current?.focus();
    expect(input).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

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
        <button type="reset">Reset form</button>
      </form>
    );
    const input = screen.getByRole("textbox", { name: "Date and time" });
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}080320261900");
    expect(input).toHaveValue("08/03/2026, 19:00");
    await user.click(screen.getByRole("button", { name: "Reset form" }));
    await Promise.resolve();
    expect(input).toHaveValue("08/02/2026, 18:30");
  });

  it("keeps manual trigger edits in draft until Apply and discards them on Cancel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        defaultOpen
        defaultValue="2026-08-11T18:30"
        label="Date and time"
        locale="en-US"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("textbox", { name: "Date and time" });
    trigger.focus();
    await user.keyboard("{Control>}a{/Control}09");
    expect(screen.getByRole("button", { name: "Open month selection" })).toHaveTextContent("August 2026");
    await user.keyboard("{Control>}a{/Control}081220260930");
    expect(trigger).toHaveValue("08/12/2026, 09:30");
    expect(screen.getByRole("button", { name: "Open month selection" })).toHaveTextContent("August 2026");
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(trigger).toHaveValue("08/11/2026, 18:30");
    expect(onChange).not.toHaveBeenCalled();

    await user.click(trigger);
    await user.keyboard("{Control>}a{/Control}091220260930");
    expect(screen.getByRole("button", { name: "Open month selection" })).toHaveTextContent("September 2026");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("2026-09-12T09:30");
    await user.click(trigger);
    expect(trigger).toHaveValue("09/12/2026, 09:30");
  });

  it("resets only the draft, then applies a clear exactly once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        defaultOpen
        defaultValue="2026-08-11T18:30"
        label="Date and time"
        locale="en-US"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("textbox", { name: "Date and time" });
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(trigger).toHaveValue("08/11/2026, 18:30");
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(trigger).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(trigger).toHaveValue("");
  });

  it("opens from the calendar addon and reports one transition", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DateTimePicker label="Date and time" locale="en-US" onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it.each([{ disabled: true }, { readOnly: true }])("does not open its addon for protected state", async (props) => {
    const user = userEvent.setup();
    render(<DateTimePicker {...props} label="Date and time" locale="en-US" />);
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("discards on outside press and reopens in days view", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <DateTimePicker
          defaultOpen
          defaultValue="2026-08-11T18:30"
          label="Date and time"
          locale="en-US"
          onChange={onChange}
        />
        <button type="button">Outside</button>
      </>
    );
    const trigger = screen.getByRole("textbox", { name: "Date and time" });
    trigger.focus();
    await user.keyboard("{Control>}a{/Control}091220260930");
    await user.click(screen.getByRole("button", { name: "Open month selection" }));
    await user.click(screen.getByRole("button", { name: "Open year selection" }));
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveValue("08/11/2026, 18:30");
    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(document.querySelector("[data-calendar-year-grid]")).not.toBeInTheDocument();
  });

  it("commits one complete manual trigger edit in immediate mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        commitMode="immediate"
        defaultOpen
        defaultValue="2026-08-11T18:30"
        label="Date and time"
        locale="en-US"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("textbox", { name: "Date and time" });
    trigger.focus();
    await user.keyboard("{Control>}a{/Control}081220260930");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("2026-08-12T09:30");
  });

  it("reopens in calendar days view", async () => {
    const user = userEvent.setup();
    render(<DateTimePicker defaultOpen label="Date and time" locale="en-US" />);
    await user.click(screen.getByRole("button", { name: "Open month selection" }));
    await user.click(screen.getByRole("button", { name: "Open year selection" }));
    expect(document.querySelector("[data-calendar-year-grid]")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("textbox", { name: "Date and time" }));
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(document.querySelector("[data-calendar-year-grid]")).not.toBeInTheDocument();
  });
});
