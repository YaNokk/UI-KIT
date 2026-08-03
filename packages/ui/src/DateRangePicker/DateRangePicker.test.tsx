// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DesignSystemProvider } from "../DesignSystemProvider";
import { DateRangePicker } from "./DateRangePicker";

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

describe("DateRangePicker", () => {
  it("keeps draft changes private until Apply", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DesignSystemProvider locale="ru-RU">
        <DateRangePicker defaultOpen onChange={onChange} />
      </DesignSystemProvider>
    );
    await user.click(screen.getByRole("button", { name: "Сегодня" }));
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toMatch(
      /^\d{2}\.\d{2}\.\d{4} — \d{2}\.\d{2}\.\d{4}$/
    );
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Применить" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0].from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("synchronizes committed text with native form reset", async () => {
    const user = userEvent.setup();
    render(
      <DesignSystemProvider locale="ru-RU">
        <form>
          <DateRangePicker defaultValue={{ from: "2026-08-01", to: "2026-08-02" }} />
          <button type="reset">Reset</button>
        </form>
      </DesignSystemProvider>
    );
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.click(screen.getByRole("button", { name: "Сегодня" }));
    await user.click(screen.getByRole("button", { name: "Применить" }));
    expect(input).not.toHaveValue("01.08.2026 — 02.08.2026");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await Promise.resolve();
    expect(input).toHaveValue("01.08.2026 — 02.08.2026");
  });

  it("drafts manual trigger edits, follows their month and commits exactly once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        defaultOpen
        defaultValue={{ from: "2026-08-11", to: "2026-08-22" }}
        label="Period"
        locale="en-US"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("textbox", { name: "Period" });
    trigger.focus();
    await user.keyboard("{Control>}a{/Control}0901202609122026");
    expect(trigger).toHaveValue("09/01/2026 — 09/12/2026");
    expect(screen.getByRole("button", { name: "Open month selection" })).toHaveTextContent("September 2026");
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(trigger).toHaveValue("08/11/2026 — 08/22/2026");

    await user.click(trigger);
    await user.keyboard("{Control>}a{/Control}0901202609122026");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ from: "2026-09-01", to: "2026-09-12" });
    await user.click(trigger);
    expect(trigger).toHaveValue("09/01/2026 — 09/12/2026");
  });

  it("resets only the draft, then applies an empty range exactly once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        defaultOpen
        defaultValue={{ from: "2026-08-11", to: "2026-08-22" }}
        label="Period"
        locale="en-US"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("textbox", { name: "Period" });
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(trigger).toHaveValue("08/11/2026 — 08/22/2026");
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ from: null, to: null });
    expect(trigger).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(trigger).toHaveValue("");
  });

  it.each([
    { from: "2026-08-11" as const, to: null },
    { from: null, to: "2026-08-22" as const }
  ])("keeps a partial range Apply-disabled: $from/$to", (defaultValue) => {
    render(<DateRangePicker defaultOpen defaultValue={defaultValue} locale="en-US" />);
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it.each([
    {
      label: "before minDate",
      defaultValue: { from: "2025-12-01" as const, to: "2026-02-01" as const },
      minDate: "2026-01-01" as const,
      maxDate: undefined,
      isDateUnavailable: undefined
    },
    {
      label: "after maxDate",
      defaultValue: { from: "2026-11-01" as const, to: "2027-01-01" as const },
      minDate: undefined,
      maxDate: "2026-12-31" as const,
      isDateUnavailable: undefined
    },
    {
      label: "unavailable boundary",
      defaultValue: { from: "2026-06-15" as const, to: "2026-06-20" as const },
      minDate: undefined,
      maxDate: undefined,
      isDateUnavailable: (date: string) => date === "2026-06-15"
    }
  ])("keeps a complete range $label Apply-disabled", ({ defaultValue, minDate, maxDate, isDateUnavailable }) => {
    render(
      <DateRangePicker
        defaultOpen
        defaultValue={defaultValue}
        isDateUnavailable={isDateUnavailable}
        locale="en-US"
        maxDate={maxDate}
        minDate={minDate}
      />
    );
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("disables invalid custom presets and enables an allowed preset", async () => {
    const user = userEvent.setup();
    const presets = [
      { id: "before", label: "Before min", resolve: () => ({ from: "2025-12-01" as const, to: "2026-02-01" as const }) },
      { id: "after", label: "After max", resolve: () => ({ from: "2026-11-01" as const, to: "2027-01-01" as const }) },
      { id: "unavailable", label: "Unavailable boundary", resolve: () => ({ from: "2026-06-15" as const, to: "2026-06-20" as const }) },
      { id: "valid", label: "Allowed range", resolve: () => ({ from: "2026-07-01" as const, to: "2026-07-10" as const }) }
    ];
    render(
      <DateRangePicker
        defaultOpen
        isDateUnavailable={(date) => date === "2026-06-15"}
        locale="en-US"
        maxDate="2026-12-31"
        minDate="2026-01-01"
        presets={presets}
      />
    );
    expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Before min" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "After max" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Unavailable boundary" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Allowed range" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Allowed range" }));
    expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled();
  });

  it("disables a standard preset that crosses a partial bound", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T12:00:00"));
    try {
      render(<DateRangePicker defaultOpen locale="en-US" minDate="2026-08-01" />);
      expect(screen.getByRole("button", { name: "This year" })).toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("opens from the calendar addon and reports one transition", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DateRangePicker label="Period" locale="en-US" onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it.each([{ disabled: true }, { readOnly: true }])("does not open its addon for protected state", async (props) => {
    const user = userEvent.setup();
    render(<DateRangePicker {...props} label="Period" locale="en-US" />);
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserves draft across equal controlled objects and accepts a changed external range", async () => {
    const user = userEvent.setup();
    const committed = { from: "2026-08-11", to: "2026-08-22" } as const;
    const { rerender } = render(
      <DateRangePicker defaultOpen label="Period" locale="en-US" value={committed} />
    );
    const trigger = screen.getByRole("textbox", { name: "Period" });
    trigger.focus();
    await user.keyboard("{Control>}a{/Control}0901202609122026");
    rerender(
      <DateRangePicker
        defaultOpen
        label="Period"
        locale="en-US"
        value={{ from: "2026-08-11", to: "2026-08-22" }}
      />
    );
    expect(trigger).toHaveValue("09/01/2026 — 09/12/2026");

    rerender(
      <DateRangePicker
        defaultOpen
        label="Period"
        locale="en-US"
        value={{ from: "2026-10-01", to: "2026-10-12" }}
      />
    );
    expect(trigger).toHaveValue("10/01/2026 — 10/12/2026");
  });

  it("discards through the mobile close action and reopens in days view", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))
    });
    Object.defineProperty(window, "scrollTo", { configurable: true, value: vi.fn() });
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        defaultValue={{ from: "2026-08-11", to: "2026-08-22" }}
        label="Period"
        locale="en-US"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole("textbox", { name: "Period" });
    await user.click(trigger);
    trigger.focus();
    await user.keyboard("{Control>}a{/Control}0901202609122026");
    await user.click(screen.getByRole("button", { name: "Open month selection" }));
    await user.click(screen.getByRole("button", { name: "Open year selection" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveValue("08/11/2026 — 08/22/2026");
    await user.click(trigger);
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(document.querySelector("[data-calendar-year-grid]")).not.toBeInTheDocument();
  });

  it("reopens in calendar days view", async () => {
    const user = userEvent.setup();
    render(<DateRangePicker defaultOpen label="Period" locale="en-US" />);
    await user.click(screen.getByRole("button", { name: "Open month selection" }));
    await user.click(screen.getByRole("button", { name: "Open year selection" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("textbox", { name: "Period" }));
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(document.querySelector("[data-calendar-year-grid]")).not.toBeInTheDocument();
  });
});
