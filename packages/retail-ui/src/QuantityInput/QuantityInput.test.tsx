// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuantityInput } from "./QuantityInput";

afterEach(cleanup);

const accessibleProps = {
  "aria-label": "Количество товара",
  decreaseLabel: "Уменьшить количество",
  increaseLabel: "Увеличить количество",
};

describe("QuantityInput", () => {
  it("steps with sibling buttons and keeps focus on the activated button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <QuantityInput
        {...accessibleProps}
        defaultValue={1}
        onChange={onChange}
      />,
    );
    const increase = screen.getByRole("button", {
      name: "Увеличить количество",
    });
    await user.click(increase);
    expect(
      screen.getByRole("spinbutton", { name: "Количество товара" }),
    ).toHaveValue("2");
    expect(onChange).toHaveBeenLastCalledWith(2);
    expect(increase).toHaveFocus();
    expect(increase).toHaveAttribute("type", "button");
    expect(
      screen.getByRole("button", { name: "Уменьшить количество" }),
    ).toHaveAttribute("type", "button");
  });

  it("disables boundary actions", () => {
    render(
      <>
        <QuantityInput {...accessibleProps} max={5} value={5} />
        <QuantityInput
          {...accessibleProps}
          aria-label="Минимальное количество"
          min={1}
          value={1}
        />
      </>,
    );
    expect(
      screen.getAllByRole("button", { name: "Увеличить количество" })[0],
    ).toBeDisabled();
    expect(
      screen.getAllByRole("button", { name: "Уменьшить количество" })[1],
    ).toBeDisabled();
  });

  it("uses decimal-safe fractional steps", async () => {
    const user = userEvent.setup();
    render(
      <QuantityInput
        {...accessibleProps}
        defaultValue={0.2}
        maximumFractionDigits={2}
        min={0}
        step={0.1}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Увеличить количество" }),
    );
    expect(screen.getByRole("spinbutton")).toHaveValue("0.3");
  });

  it("keeps keyboard and button stepping in parity", async () => {
    const user = userEvent.setup();
    render(
      <>
        <QuantityInput
          aria-label="Клавиатурное количество"
          decreaseLabel="Уменьшить клавиатурное количество"
          defaultValue={0.2}
          increaseLabel="Увеличить клавиатурное количество"
          maximumFractionDigits={2}
          min={0}
          step={0.1}
        />
        <QuantityInput
          aria-label="Кнопочное количество"
          decreaseLabel="Уменьшить кнопочное количество"
          defaultValue={0.2}
          increaseLabel="Увеличить кнопочное количество"
          maximumFractionDigits={2}
          min={0}
          step={0.1}
        />
      </>,
    );
    const keyboardInput = screen.getByRole("spinbutton", {
      name: "Клавиатурное количество",
    });
    await user.click(keyboardInput);
    await user.keyboard("{ArrowUp}");
    await user.click(
      screen.getByRole("button", {
        name: "Увеличить кнопочное количество",
      }),
    );
    expect(keyboardInput).toHaveValue("0.3");
    expect(
      screen.getByRole("spinbutton", { name: "Кнопочное количество" }),
    ).toHaveValue("0.3");
  });

  it("restores min on blur after an empty edit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <QuantityInput
        {...accessibleProps}
        defaultValue={2}
        min={1}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    expect(onChange).toHaveBeenLastCalledWith(null);
    await user.tab();
    expect(input).toHaveValue("1");
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("applies the retail null policy after forwarding blur", async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    render(
      <QuantityInput
        {...accessibleProps}
        defaultValue={2}
        min={1}
        onBlur={() => order.push("blur")}
        onChange={(nextValue) => order.push(`change:${String(nextValue)}`)}
      />,
    );
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    order.length = 0;
    await user.tab();
    expect(order).toEqual(["blur", "change:1"]);
  });

  it("disables all actions in disabled and read-only states", () => {
    const { rerender } = render(
      <QuantityInput {...accessibleProps} disabled value={2} />,
    );
    expect(
      screen.getAllByRole("button").every((button) => button.hasAttribute("disabled")),
    ).toBe(true);
    rerender(<QuantityInput {...accessibleProps} readOnly value={2} />);
    expect(
      screen.getAllByRole("button").every((button) => button.hasAttribute("disabled")),
    ).toBe(true);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <QuantityInput {...accessibleProps} max={10} value={2} />,
    );
    expect((await axe.run(container)).violations).toEqual([]);
  });
});
