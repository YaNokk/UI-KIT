// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DesignSystemProvider } from "../DesignSystemProvider";
import { DateTimeRangePicker } from "./DateTimeRangePicker";

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

describe("DateTimeRangePicker", () => {
  it("inherits all picker labels and presets from the provider locale", () => {
    render(
      <DesignSystemProvider locale="ru-RU">
        <DateTimeRangePicker defaultOpen timeZone="Europe/Kaliningrad" />
      </DesignSystemProvider>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Выберите период и время" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Предыдущий месяц" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Открыть выбор месяца" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Последние 24 часа" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Выберите период и время" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сбросить" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Применить" })).toBeDisabled();
  });

  it("rejects a same-day end time before the start time", () => {
    render(
      <DesignSystemProvider locale="ru-RU">
        <DateTimeRangePicker
          defaultOpen
          defaultValue={{ from: "2026-08-02T18:00", to: "2026-08-02T09:00" }}
          timeZone="Europe/Kaliningrad"
        />
      </DesignSystemProvider>
    );
    expect(screen.getByRole("button", { name: "Применить" })).toBeDisabled();
    expect(screen.getByText("Дата или время окончания раньше начала")).toBeVisible();
  });

  it("preserves the boundary time when the calendar changes its date", async () => {
    const user = userEvent.setup();
    render(
      <DesignSystemProvider locale="en-US">
        <DateTimeRangePicker
          defaultOpen
          defaultValue={{ from: "2026-08-02T18:00", to: "2026-08-03T19:00" }}
          timeZone="Europe/Kaliningrad"
        />
      </DesignSystemProvider>
    );
    await user.click(screen.getByRole("gridcell", { name: "Wednesday, August 5, 2026" }));
    expect(screen.getByRole("textbox", { name: "Choose date and time range" })).toHaveValue(
      "08/05/2026, 18:00 — "
    );
  });

  it("disables Apply while a boundary contains partial input", async () => {
    const user = userEvent.setup();
    render(
      <DesignSystemProvider locale="en-US">
        <DateTimeRangePicker
          defaultOpen
          defaultValue={{ from: "2026-08-02T18:00", to: "2026-08-03T19:00" }}
          timeZone="Europe/Kaliningrad"
        />
      </DesignSystemProvider>
    );
    const surfaceInput = screen.getByRole("textbox", { name: "Choose date and time range" });
    await user.click(surfaceInput);
    await user.keyboard("{Control>}a{/Control}08");
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("fails deterministically for an invalid timezone", () => {
    expect(() => render(
      <DesignSystemProvider>
        <DateTimeRangePicker timeZone="Invalid/Zone" />
      </DesignSystemProvider>
    )).toThrow(RangeError);
  });
});
