// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar";

afterEach(cleanup);

describe("Calendar navigation", () => {
  it("exposes localized month/year selectors and clamps arrow navigation", async () => {
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
    expect(screen.getByLabelText("Выберите месяц")).toBeInTheDocument();
    expect(screen.getByLabelText("Выберите год")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Следующий месяц" }));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 8, 1));
    await user.click(screen.getByLabelText("Выберите месяц"));
    await user.click(screen.getByRole("option", { name: "сентябрь" }));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 8, 1));
    await user.click(screen.getByLabelText("Выберите год"));
    await user.click(screen.getByRole("option", { name: "2027" }));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2027, 1, 1));

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
});
