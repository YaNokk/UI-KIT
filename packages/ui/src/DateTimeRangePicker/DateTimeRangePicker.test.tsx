// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
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

  it("fails deterministically for an invalid timezone", () => {
    expect(() => render(
      <DesignSystemProvider>
        <DateTimeRangePicker timeZone="Invalid/Zone" />
      </DesignSystemProvider>
    )).toThrow(RangeError);
  });
});
