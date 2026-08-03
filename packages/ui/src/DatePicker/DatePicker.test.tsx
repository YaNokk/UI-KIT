// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
