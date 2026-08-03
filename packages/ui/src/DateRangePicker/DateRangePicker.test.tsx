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
