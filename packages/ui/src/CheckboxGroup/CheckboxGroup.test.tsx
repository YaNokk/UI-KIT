// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
        label="Каналы"
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
          label="Каналы"
          name="channels"
          options={options}
          required
        />
      </form>
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("Expected form fixture");
    const values = new FormData(form).getAll("channels");
    expect(values).toEqual(["email", "sms"]);
    expect(screen.getByRole("group", { name: "Каналы" })).toHaveAttribute("aria-required", "true");
    for (const checkbox of screen.getAllByRole("checkbox")) expect(checkbox).not.toBeRequired();
  });

  it("lets group error replace its description", () => {
    render(
      <CheckboxGroup
        description="Можно выбрать несколько"
        error="Выберите канал"
        label="Каналы"
        options={options}
      />
    );
    expect(screen.queryByText("Можно выбрать несколько")).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Каналы" })).toHaveAttribute("aria-invalid", "true");
  });
});
