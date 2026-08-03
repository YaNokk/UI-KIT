// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateRangeInput } from "./DateRangeInput";

afterEach(cleanup);

describe("DateRangeInput", () => {
  it("uses one physical input and serializes canonical hidden values", () => {
    const { container } = render(
      <form data-testid="form">
        <DateRangeInput
          fromName="from"
          label="Период"
          locale="ru-RU"
          toName="to"
          value={{ from: "2026-08-01", to: "2026-08-07" }}
        />
      </form>
    );
    expect(container.querySelectorAll("input:not([type='hidden'])")).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: "Период" })).toHaveValue("01.08.2026 — 07.08.2026");
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.get("from")).toBe("2026-08-01");
    expect(data.get("to")).toBe("2026-08-07");
  });

  it("emits only a complete valid range and preserves canonical state for partial text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangeInput
        aria-label="Период"
        locale="ru-RU"
        onChange={onChange}
        value={{ from: "2026-08-01", to: "2026-08-07" }}
      />
    );
    const input = screen.getByRole("textbox", { name: "Период" });
    await user.click(input);
    await user.keyboard("{Control>}a{/Control}02");
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard("{Control>}a{/Control}0208202609082026");
    expect(onChange).toHaveBeenLastCalledWith({ from: "2026-08-02", to: "2026-08-09" });
  });

  it("uses localized Russian placeholders", () => {
    render(<DateRangeInput aria-label="Период" locale="ru-RU" />);
    expect(screen.getByRole("textbox", { name: "Период" })).toHaveAttribute(
      "placeholder",
      "ДД.ММ.ГГГГ — ДД.ММ.ГГГГ"
    );
  });
});
