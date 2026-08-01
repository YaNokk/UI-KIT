// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RadioGroup } from "./RadioGroup";

afterEach(cleanup);

const options = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { disabled: true, label: "Monthly", value: "monthly" }
] as const;

describe("RadioGroup", () => {
  it("generates one stable name and emits the selected value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <RadioGroup label="Frequency" onChange={onChange} options={options} />
    );
    const names = screen.getAllByRole("radio").map((radio) => radio.getAttribute("name"));
    expect(new Set(names).size).toBe(1);
    rerender(<RadioGroup label="Frequency" onChange={onChange} options={options} />);
    expect(screen.getAllByRole("radio")[0]).toHaveAttribute("name", names[0]);

    await user.click(screen.getByRole("radio", { name: "Weekly" }));
    expect(onChange).toHaveBeenCalledWith("weekly", expect.objectContaining({ type: "change" }));
  });

  it("applies native required to enabled radios and propagates disabled", () => {
    render(<RadioGroup disabled label="Frequency" options={options} required />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();

    cleanup();
    render(<RadioGroup label="Frequency" options={options} required />);
    expect(screen.getByRole("radio", { name: "Daily" })).toBeRequired();
    expect(screen.getByRole("radio", { name: "Weekly" })).toBeRequired();
    expect(screen.getByRole("radio", { name: "Monthly" })).not.toBeRequired();
  });

  it("keeps group invalid state on the fieldset", () => {
    render(<RadioGroup error="Select a frequency" label="Frequency" options={options} />);
    const group = screen.getByRole("group", { name: "Frequency" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group.getAttribute("aria-describedby")).toContain("error");
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).not.toHaveAttribute("aria-invalid");
      expect(radio.nextElementSibling).not.toHaveAttribute("data-invalid");
    }
  });

  it("keeps option descriptions associated only with their matching radio", () => {
    render(
      <RadioGroup
        description="Choose one frequency"
        error="Select a frequency"
        label="Frequency"
        options={[
          { description: "Every day", label: "Daily", value: "daily" },
          { description: "Every week", label: "Weekly", value: "weekly" }
        ]}
      />
    );
    const group = screen.getByRole("group", { name: "Frequency" });
    const daily = screen.getByRole("radio", { name: "Daily" });
    const weekly = screen.getByRole("radio", { name: "Weekly" });

    expect(group.getAttribute("aria-describedby")).toContain("error");
    expect(group.getAttribute("aria-describedby")).not.toContain("description");
    expect(daily.getAttribute("aria-describedby")).toContain("description");
    expect(weekly.getAttribute("aria-describedby")).toContain("description");
    expect(daily.getAttribute("aria-describedby")).not.toBe(
      weekly.getAttribute("aria-describedby")
    );
    expect(daily.getAttribute("aria-describedby")).not.toContain("error");
    expect(weekly.getAttribute("aria-describedby")).not.toContain("error");
    expect(screen.queryByText("Choose one frequency")).not.toBeInTheDocument();
  });

  it("does not mutate a controlled value until it is rerendered", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <RadioGroup label="Frequency" onChange={onChange} options={options} value="daily" />
    );

    await user.click(screen.getByRole("radio", { name: "Weekly" }));
    expect(onChange).toHaveBeenCalledWith(
      "weekly",
      expect.objectContaining({ type: "change" })
    );
    expect(screen.getByRole("radio", { name: "Daily" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Weekly" })).not.toBeChecked();

    rerender(
      <RadioGroup label="Frequency" onChange={onChange} options={options} value="weekly" />
    );
    expect(screen.getByRole("radio", { name: "Weekly" })).toBeChecked();
  });

  it("updates an uncontrolled value", async () => {
    const user = userEvent.setup();
    render(<RadioGroup defaultValue="daily" label="Frequency" options={options} />);
    await user.click(screen.getByRole("radio", { name: "Weekly" }));
    expect(screen.getByRole("radio", { name: "Weekly" })).toBeChecked();
  });

  it("has no detectable axe violations across group variants", async () => {
    const { container } = render(
      <>
        <RadioGroup
          description="Choose one"
          label="Horizontal frequency"
          options={options}
          orientation="horizontal"
          required
        />
        <RadioGroup disabled label="Disabled frequency" options={options} />
        <RadioGroup error="Select one" label="Invalid frequency" options={options} />
      </>
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
