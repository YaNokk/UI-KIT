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
});
