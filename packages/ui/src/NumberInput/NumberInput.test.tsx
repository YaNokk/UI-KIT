// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createRef, useState } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DesignSystemProvider } from "../DesignSystemProvider";
import {
  NumberInput,
  type NumberInputActions,
} from "./NumberInput";

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

  it("shares the keyboard stepping path through typed composition actions", async () => {
    const user = userEvent.setup();
    const actionsRef = createRef<NumberInputActions>();
    render(
      <>
        <NumberInput
          aria-label="Шаг"
          actionsRef={actionsRef}
          defaultValue={0.2}
          maximumFractionDigits={2}
          step={0.1}
        />
        <button onClick={() => actionsRef.current?.increment()} type="button">
          Увеличить
        </button>
        <button onClick={() => actionsRef.current?.decrement()} type="button">
          Уменьшить
        </button>
      </>,
    );
    const input = screen.getByRole("spinbutton", { name: "Шаг" });
    await user.click(screen.getByRole("button", { name: "Увеличить" }));
    expect(input).toHaveValue("0.3");
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveValue("0.2");
    await user.click(screen.getByRole("button", { name: "Уменьшить" }));
    expect(input).toHaveValue("0.1");
  });

  it("keeps actions current across props and separate from the native ref", () => {
    const actionsRef = createRef<NumberInputActions>();
    const inputRef = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const { rerender } = render(
      <NumberInput
        actionsRef={actionsRef}
        aria-label="Составной контрол"
        onChange={onChange}
        ref={inputRef}
        value={1}
      />,
    );

    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(actionsRef.current?.increment).toBeTypeOf("function");
    act(() => actionsRef.current?.increment());
    expect(onChange).toHaveBeenLastCalledWith(2, { inputValue: "2" });

    rerender(
      <NumberInput
        actionsRef={actionsRef}
        aria-label="Составной контрол"
        onChange={onChange}
        ref={inputRef}
        step={0.5}
        value={5}
      />,
    );
    act(() => actionsRef.current?.decrement());
    expect(onChange).toHaveBeenLastCalledWith(4.5, { inputValue: "4.5" });

    onChange.mockClear();
    rerender(
      <NumberInput
        actionsRef={actionsRef}
        aria-label="Составной контрол"
        onChange={onChange}
        readOnly
        ref={inputRef}
        value={5}
      />,
    );
    act(() => actionsRef.current?.increment());
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      <NumberInput
        actionsRef={actionsRef}
        aria-label="Составной контрол"
        disabled
        onChange={onChange}
        ref={inputRef}
        value={5}
      />,
    );
    act(() => actionsRef.current?.decrement());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not emit when a scaled step would leave the safe integer range", () => {
    const actionsRef = createRef<NumberInputActions>();
    const onChange = vi.fn();
    const value = Number.MAX_SAFE_INTEGER / 10;
    render(
      <NumberInput
        actionsRef={actionsRef}
        aria-label="Большое значение"
        maximumFractionDigits={1}
        onChange={onChange}
        step={0.1}
        value={value}
      />,
    );

    act(() => actionsRef.current?.increment());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps natural editing text and applies minimum fraction digits on blur", async () => {
    const user = userEvent.setup();
    render(
      <NumberInput
        aria-label="Точность"
        maximumFractionDigits={2}
        minimumFractionDigits={2}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Точность" });
    await user.type(input, "1.2");
    expect(input).toHaveValue("1.2");
    await user.tab();
    expect(input).toHaveValue("1.20");
  });

  it("keeps aria-valuenow aligned when a controlled consumer rejects an update", async () => {
    const user = userEvent.setup();
    render(
      <NumberInput
        aria-label="Контролируемое число"
        onChange={() => undefined}
        value={1}
      />,
    );
    const input = screen.getByRole("spinbutton", {
      name: "Контролируемое число",
    });
    await user.clear(input);
    await user.type(input, "2");
    expect(input).toHaveValue("1");
    expect(input).toHaveAttribute("aria-valuenow", "1");
  });

  it("omits aria-valuenow for empty and intermediate decimal editing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NumberInput
        aria-label="Промежуточное число"
        locale="ru-RU"
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("spinbutton", {
      name: "Промежуточное число",
    });

    expect(input).not.toHaveAttribute("aria-valuenow");
    await user.type(input, "1,");
    expect(input).toHaveValue("1,");
    expect(input).not.toHaveAttribute("aria-valuenow");
    expect(onChange).toHaveBeenLastCalledWith(null, { inputValue: "1," });
  });

  it("exposes numeric min/max ARIA and displays a large safe integer", () => {
    render(
      <NumberInput
        aria-label="Диапазон"
        locale="en-US"
        max={Number.MAX_SAFE_INTEGER}
        maximumFractionDigits={0}
        min={-10}
        value={Number.MAX_SAFE_INTEGER}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Диапазон" });
    expect(input).toHaveAttribute("aria-valuemin", "-10");
    expect(input).toHaveAttribute(
      "aria-valuemax",
      String(Number.MAX_SAFE_INTEGER),
    );
    expect(input).toHaveAttribute(
      "aria-valuenow",
      String(Number.MAX_SAFE_INTEGER),
    );
    expect(input).toHaveValue("9,007,199,254,740,991");
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

  it("serializes the localized visible value through a native name", () => {
    const { container } = render(
      <form>
        <NumberInput
          aria-label="Вес формы"
          locale="ru-RU"
          name="weight"
          value={1234.5}
        />
      </form>,
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("Expected a form element.");
    expect(new FormData(form).get("weight")).toBe("1 234,5");
    expect(form.querySelector('input[type="hidden"]')).not.toBeInTheDocument();
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
