// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DesignSystemProvider } from "../DesignSystemProvider";
import { NumberInput } from "./NumberInput";

afterEach(cleanup);

describe("NumberInput", () => {
  it("maps locale editing text to number|null and keeps zero distinct", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NumberInput
        aria-label="Количество"
        locale="ru-RU"
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Количество" });
    await user.type(input, "12,5");
    expect(onChange).toHaveBeenLastCalledWith(12.5, {
      inputValue: "12,5",
    });
    await user.clear(input);
    expect(onChange).toHaveBeenLastCalledWith(null, { inputValue: "" });
    await user.type(input, "0");
    expect(onChange).toHaveBeenLastCalledWith(0, { inputValue: "0" });
  });

  it("uses one decimal-safe stepping policy for keyboard arrows", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NumberInput
        aria-label="Вес"
        defaultValue={0.2}
        maximumFractionDigits={2}
        onChange={onChange}
        step={0.1}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Вес" });
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("0.3");
    expect(onChange).toHaveBeenLastCalledWith(0.3, { inputValue: "0.3" });
  });

  it("allows temporary out-of-range editing and clamps on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NumberInput
        aria-label="Оценка"
        max={10}
        min={1}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Оценка" });
    await user.type(input, "20");
    expect(input).toHaveValue("20");
    await user.tab();
    expect(input).toHaveValue("10");
    expect(onChange).toHaveBeenLastCalledWith(10, { inputValue: "10" });
  });

  it("inherits provider locale and reacts to controlled updates", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [value, setValue] = useState<number | null>(1234.5);
      return (
        <DesignSystemProvider locale="ru-RU" mode="light">
          <NumberInput
            aria-label="Число"
            onChange={setValue}
            value={value}
          />
          <button onClick={() => setValue(5.25)} type="button">
            Обновить
          </button>
        </DesignSystemProvider>
      );
    }

    render(<Controlled />);
    expect(screen.getByRole("spinbutton", { name: "Число" })).toHaveValue(
      "1 234,5",
    );
    await user.click(screen.getByRole("button", { name: "Обновить" }));
    expect(screen.getByRole("spinbutton", { name: "Число" })).toHaveValue(
      "5,25",
    );
  });

  it("keeps external negative values visible when typing negatives is disallowed", () => {
    render(
      <NumberInput
        allowNegative={false}
        aria-label="Внешнее значение"
        value={-5}
      />,
    );
    expect(
      screen.getByRole("spinbutton", { name: "Внешнее значение" }),
    ).toHaveValue("-5");
  });

  it("does not step disabled or read-only fields and forwards the native ref", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const ref = { current: null as HTMLInputElement | null };
    render(
      <>
        <NumberInput
          aria-label="Только чтение"
          onChange={onChange}
          readOnly
          ref={ref}
          value={2}
        />
        <NumberInput aria-label="Отключено" disabled value={2} />
      </>,
    );
    await user.click(screen.getByRole("spinbutton", { name: "Только чтение" }));
    await user.keyboard("{ArrowUp}");
    expect(onChange).not.toHaveBeenCalled();
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByRole("spinbutton", { name: "Отключено" })).toBeDisabled();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <NumberInput
        hint="Допустимое значение от 1 до 10"
        id="rating"
        label="Оценка"
        max={10}
        min={1}
        value={5}
      />,
    );
    expect((await axe.run(container)).violations).toEqual([]);
  });
});
