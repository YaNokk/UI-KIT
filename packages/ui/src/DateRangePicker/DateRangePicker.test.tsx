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
});
