// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar";

afterEach(cleanup);

describe("Calendar navigation", () => {
  it("exposes calendar-native month/year modes and clamps navigation", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    const { rerender } = render(
      <Calendar
        locale="ru-RU"
        maxDate="2027-02-20"
        minDate="2026-07-10"
        month={new Date(2026, 7, 1)}
        onMonthChange={onMonthChange}
        onSelect={vi.fn()}
        weekStartsOn={1}
      />
    );
    expect(screen.getByRole("button", { name: "Открыть выбор месяца" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Следующий месяц" }));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 8, 1));
    await user.click(screen.getByRole("button", { name: "Открыть выбор месяца" }));
    expect(document.querySelector("[data-calendar-month-grid]")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "сентябрь" }));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 8, 1));
    await user.click(screen.getByRole("button", { name: "Открыть выбор месяца" }));
    await user.click(screen.getByRole("button", { name: "Открыть выбор года" }));
    expect(document.querySelector("[data-calendar-year-grid]")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "2027" }));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2027, 1, 1));
    await user.click(screen.getByRole("button", { name: "Вернуться к дням календаря" }));

    rerender(
      <Calendar
        locale="ru-RU"
        maxDate="2026-09-20"
        minDate="2026-07-10"
        month={new Date(2026, 8, 1)}
        onMonthChange={onMonthChange}
        onSelect={vi.fn()}
        weekStartsOn={1}
      />
    );
    expect(screen.getByRole("button", { name: "Следующий месяц" })).toBeDisabled();
  });

  it("returns from years to months and resets to days when resetViewKey changes", async () => {
    const user = userEvent.setup();
    const props = {
      locale: "en-US",
      month: new Date(2026, 7, 1),
      onMonthChange: vi.fn(),
      onSelect: vi.fn(),
      weekStartsOn: 0 as const
    };
    const { rerender } = render(<Calendar {...props} resetViewKey={0} />);
    await user.click(screen.getByRole("button", { name: "Open month selection" }));
    await user.click(screen.getByRole("button", { name: "Open year selection" }));
    expect(document.querySelector("[data-calendar-year-grid]")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to month selection" }));
    expect(document.querySelector("[data-calendar-month-grid]")).toBeInTheDocument();
    expect(document.querySelector("[data-calendar-year-grid]")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open year selection" }));
    rerender(<Calendar {...props} resetViewKey={1} />);
    expect(screen.getByRole("grid", { name: "August 2026" })).toBeInTheDocument();
    expect(document.querySelector("[data-calendar-year-grid]")).not.toBeInTheDocument();
  });
});
