// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateTimeRangeInput } from "./DateTimeRangeInput";

afterEach(cleanup);

describe("DateTimeRangeInput", () => {
  it("uses one physical input and canonical hidden fields", () => {
    const { container } = render(
      <form data-testid="form">
        <DateTimeRangeInput
          fromName="from"
          label="Период"
          locale="ru-RU"
          toName="to"
          value={{ from: "2026-08-02T09:00", to: "2026-08-03T18:00" }}
        />
      </form>
    );
    expect(container.querySelectorAll("input:not([type='hidden'])")).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: "Период" })).toHaveValue(
      "02.08.2026, 09:00 — 03.08.2026, 18:00"
    );
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.get("from")).toBe("2026-08-02T09:00");
    expect(data.get("to")).toBe("2026-08-03T18:00");
  });

  it("reports a reversed same-day time without swapping boundaries", () => {
    render(
      <DateTimeRangeInput
        locale="ru-RU"
        label="Период"
        value={{ from: "2026-08-02T18:00", to: "2026-08-02T09:00" }}
      />
    );
    expect(screen.getByText("Дата или время окончания раньше начала")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Период" })).toHaveValue(
      "02.08.2026, 18:00 — 02.08.2026, 09:00"
    );
  });

  it("does not mutate the canonical range for partial or minute-step-invalid text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimeRangeInput
        aria-label="Период"
        locale="ru-RU"
        minuteStep={15}
        onChange={onChange}
        value={{ from: "2026-08-02T18:00", to: "2026-08-03T19:00" }}
      />
    );
    const input = screen.getByRole("textbox", { name: "Период" });
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}02");
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard("{Control>}a{/Control}020820261820030820261900");
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard("{Control>}a{/Control}020820261830030820261845");
    expect(onChange).toHaveBeenLastCalledWith({
      from: "2026-08-02T18:30",
      to: "2026-08-03T18:45"
    });
  });
});
