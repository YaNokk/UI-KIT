// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DesignSystemProvider } from "../DesignSystemProvider";
import { DatePicker } from "./DatePicker";

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

describe("DatePicker", () => {
  it("forwards its ref to the trigger input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<DatePicker label="Date" locale="en-US" ref={ref} />);
    const input = screen.getByRole("textbox", { name: "Date" });

    expect(ref.current).toBe(input);
    ref.current?.focus();
    expect(input).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("commits a selected date immediately by default", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DesignSystemProvider locale="ru-RU">
        <DatePicker defaultOpen onChange={onChange} />
      </DesignSystemProvider>
    );
    await user.click(screen.getByRole("gridcell", { current: "date" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("lets an explicit locale override the provider locale", () => {
    render(
      <DesignSystemProvider locale="ru-RU">
        <DatePicker defaultOpen locale="en-US" />
      </DesignSystemProvider>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choose a date" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open month selection" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Предыдущий месяц" })).not.toBeInTheDocument();
  });

  it("drafts manual trigger edits and commits them exactly once on Apply", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        commitMode="apply"
        defaultOpen
        defaultValue="2026-08-11"
        label="Date"
        locale="en-US"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("textbox", { name: "Date" });
    trigger.focus();
    await user.keyboard("{Control>}a{/Control}09122026");
    expect(trigger).toHaveValue("09/12/2026");
    expect(screen.getByRole("button", { name: "Open month selection" })).toHaveTextContent("September 2026");
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(trigger).toHaveValue("08/11/2026");
    expect(onChange).not.toHaveBeenCalled();

    await user.click(trigger);
    await user.keyboard("{Control>}a{/Control}09122026");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("2026-09-12");
    await user.click(trigger);
    expect(trigger).toHaveValue("09/12/2026");
  });

  it("resets only the draft, then applies a clear exactly once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        commitMode="apply"
        defaultOpen
        defaultValue="2026-08-11"
        label="Date"
        locale="en-US"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("textbox", { name: "Date" });
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(trigger).toHaveValue("08/11/2026");
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

  it("opens from the localized calendar addon and reports one transition", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DatePicker label="Дата" locale="ru-RU" onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "Открыть календарь" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it.each([{ disabled: true }, { readOnly: true }])("does not open its addon for protected state", async (props) => {
    const user = userEvent.setup();
    render(<DatePicker {...props} label="Date" locale="en-US" />);
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("discards on Escape and reopens in days view", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        commitMode="apply"
        defaultOpen
        defaultValue="2026-08-11"
        label="Date"
        locale="en-US"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("textbox", { name: "Date" });
    trigger.focus();
    await user.keyboard("{Control>}a{/Control}09122026");
    await user.click(screen.getByRole("button", { name: "Open month selection" }));
    await user.click(screen.getByRole("button", { name: "Open year selection" }));
    await user.keyboard("{Escape}");
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveValue("08/11/2026");
    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(document.querySelector("[data-calendar-year-grid]")).not.toBeInTheDocument();
  });

  it("reopens in calendar days view", async () => {
    const user = userEvent.setup();
    render(<DatePicker commitMode="apply" defaultOpen defaultValue="2026-08-11" label="Date" locale="en-US" />);
    const trigger = screen.getByRole("textbox", { name: "Date" });
    await user.click(screen.getByRole("button", { name: "Open month selection" }));
    await user.click(screen.getByRole("button", { name: "Open year selection" }));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open month selection" })).toBeInTheDocument();
  });
});
