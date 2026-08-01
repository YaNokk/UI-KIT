// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RadioGroup } from "./RadioGroup";

afterEach(cleanup);

const options = [
  { label: "Ежедневно", value: "daily" },
  { label: "Еженедельно", value: "weekly" },
  { disabled: true, label: "Ежемесячно", value: "monthly" }
] as const;

describe("RadioGroup", () => {
  it("generates one stable name and emits the selected value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <RadioGroup label="Частота" onChange={onChange} options={options} />
    );
    const names = screen.getAllByRole("radio").map((radio) => radio.getAttribute("name"));
    expect(new Set(names).size).toBe(1);
    rerender(<RadioGroup label="Частота" onChange={onChange} options={options} />);
    expect(screen.getAllByRole("radio")[0]).toHaveAttribute("name", names[0]);

    await user.click(screen.getByRole("radio", { name: "Еженедельно" }));
    expect(onChange).toHaveBeenCalledWith("weekly", expect.objectContaining({ type: "change" }));
  });

  it("applies native required to enabled radios and propagates disabled", () => {
    render(<RadioGroup disabled label="Частота" options={options} required />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();

    cleanup();
    render(<RadioGroup label="Частота" options={options} required />);
    expect(screen.getByRole("radio", { name: "Ежедневно" })).toBeRequired();
    expect(screen.getByRole("radio", { name: "Еженедельно" })).toBeRequired();
    expect(screen.getByRole("radio", { name: "Ежемесячно" })).not.toBeRequired();
  });

  it("associates error with the named fieldset", () => {
    render(<RadioGroup error="Выберите частоту" label="Частота" options={options} />);
    const group = screen.getByRole("group", { name: "Частота" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group.getAttribute("aria-describedby")).toContain("error");
  });
});
