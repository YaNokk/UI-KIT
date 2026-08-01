// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckboxGroup } from "./CheckboxGroup";

afterEach(cleanup);

const options = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { disabled: true, label: "Push", value: "push" }
] as const;

describe("CheckboxGroup", () => {
  it("emits unique selected values in option order", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CheckboxGroup
        defaultValue={["sms"]}
        label="Channels"
        onChange={onChange}
        options={options}
      />
    );

    await user.click(screen.getByRole("checkbox", { name: "Email" }));
    expect(onChange).toHaveBeenLastCalledWith(
      ["email", "sms"],
      expect.objectContaining({ type: "change" })
    );
    expect(screen.getByRole("checkbox", { name: "Push" })).toBeDisabled();
  });

  it("uses repeated native name/value entries without native required on items", () => {
    const { container } = render(
      <form>
        <CheckboxGroup
          defaultValue={["email", "sms"]}
          label="Channels"
          name="channels"
          options={options}
          required
        />
      </form>
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("Expected form fixture");
    expect(new FormData(form).getAll("channels")).toEqual(["email", "sms"]);
    expect(screen.getByRole("group", { name: "Channels" })).toHaveAttribute("data-required");
    expect(screen.getByRole("group", { name: "Channels" })).not.toHaveAttribute("aria-required");
    for (const checkbox of screen.getAllByRole("checkbox")) {
      expect(checkbox).not.toBeRequired();
    }
  });

  it("keeps group invalid state on the fieldset and replaces description", () => {
    render(
      <CheckboxGroup
        description="Choose several"
        error="Select a channel"
        label="Channels"
        options={options}
      />
    );
    const group = screen.getByRole("group", { name: "Channels" });
    expect(screen.queryByText("Choose several")).not.toBeInTheDocument();
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group.getAttribute("aria-describedby")).toContain("error");
    for (const checkbox of screen.getAllByRole("checkbox")) {
      expect(checkbox).not.toHaveAttribute("aria-invalid");
      expect(checkbox.nextElementSibling).not.toHaveAttribute("data-invalid");
    }
  });

  it("does not mutate a controlled value until it is rerendered", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <CheckboxGroup
        label="Channels"
        onChange={onChange}
        options={options}
        value={["email"]}
      />
    );

    await user.click(screen.getByRole("checkbox", { name: "SMS" }));
    expect(onChange).toHaveBeenCalledWith(
      ["email", "sms"],
      expect.objectContaining({ type: "change" })
    );
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "SMS" })).not.toBeChecked();

    rerender(
      <CheckboxGroup
        label="Channels"
        onChange={onChange}
        options={options}
        value={["email", "sms"]}
      />
    );
    expect(screen.getByRole("checkbox", { name: "SMS" })).toBeChecked();
  });

  it("updates an uncontrolled value", async () => {
    const user = userEvent.setup();
    render(<CheckboxGroup defaultValue={["email"]} label="Channels" options={options} />);
    await user.click(screen.getByRole("checkbox", { name: "SMS" }));
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "SMS" })).toBeChecked();
  });

  it("has no detectable axe violations across group variants", async () => {
    const { container } = render(
      <>
        <CheckboxGroup
          description="Choose several"
          label="Horizontal channels"
          options={options}
          orientation="horizontal"
        />
        <CheckboxGroup disabled label="Disabled channels" options={options} />
        <CheckboxGroup error="Select one" label="Invalid channels" options={options} />
      </>
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
