// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DateTimeRangeInput } from "./DateTimeRangeInput";

afterEach(cleanup);

describe("DateTimeRangeInput", () => {
  it("composes exactly two physical DateTimeInput controls and canonical hidden fields", () => {
    const { container } = render(
      <form data-testid="form">
        <DateTimeRangeInput
          fromName="from"
          locale="ru-RU"
          toName="to"
          value={{ from: "2026-08-02T09:00", to: "2026-08-03T18:00" }}
        />
      </form>
    );
    expect(container.querySelectorAll("input:not([type='hidden'])")).toHaveLength(2);
    expect(screen.getByRole("textbox", { name: "Дата и время начала" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Дата и время окончания" })).toBeInTheDocument();
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.get("from")).toBe("2026-08-02T09:00");
    expect(data.get("to")).toBe("2026-08-03T18:00");
  });

  it("reports a reversed same-day time without swapping boundaries", () => {
    render(
      <DateTimeRangeInput
        locale="ru-RU"
        value={{ from: "2026-08-02T18:00", to: "2026-08-02T09:00" }}
      />
    );
    expect(screen.getByText("Дата или время окончания раньше начала")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Дата и время начала" })).toHaveValue("02.08.2026, 18:00");
    expect(screen.getByRole("textbox", { name: "Дата и время окончания" })).toHaveValue("02.08.2026, 09:00");
  });
});
