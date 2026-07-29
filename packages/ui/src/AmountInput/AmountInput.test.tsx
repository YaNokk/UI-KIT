// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AmountInput } from "./AmountInput";

afterEach(cleanup);

describe("AmountInput", () => {
  it("maps editing text to semantic minor units and keeps zero distinct", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AmountInput
        aria-label="Сумма"
        locale="ru-RU"
        minority={100}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("textbox", { name: "Сумма" });
    await user.type(input, "12,50");
    expect(onChange).toHaveBeenLastCalledWith(1250, { inputValue: "12,50" });
    await user.clear(input);
    expect(onChange).toHaveBeenLastCalledWith(null, { inputValue: "" });
    await user.type(input, "0");
    expect(onChange).toHaveBeenLastCalledWith(0, { inputValue: "0" });
  });

  it("supports controlled updates without exposing formatted text as value", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<number | null>(123456);
      return (
        <>
          <AmountInput
            aria-label="Цена"
            currency="PLN"
            locale="pl-PL"
            onChange={setValue}
            value={value}
          />
          <button onClick={() => setValue(500)} type="button">Update</button>
        </>
      );
    }

    render(<Controlled />);
    expect(screen.getByLabelText("Цена")).toHaveValue("1 234,56 zł");
    await user.click(screen.getByRole("button", { name: "Update" }));
    expect(screen.getByLabelText("Цена")).toHaveValue("5 zł");
  });

  it("inherits label, error, disabled, readOnly and ref behavior", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(
      <>
        <AmountInput error="Некорректная сумма" id="amount" label="Сумма" ref={ref} />
        <AmountInput aria-label="Disabled" disabled />
        <AmountInput aria-label="Read only" readOnly value={100} />
      </>
    );

    expect(ref.current).toBe(screen.getByLabelText("Сумма"));
    expect(ref.current).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Disabled")).toBeDisabled();
    expect(screen.getByLabelText("Read only")).toHaveAttribute("readonly");
  });

  it("renders currency inside the fixed masked value using locale metadata", () => {
    const { rerender } = render(
      <AmountInput aria-label="USD" currency="USD" locale="en-US" value={100} />
    );
    const usd = screen.getByLabelText("USD");
    expect(usd).toHaveValue("$1");
    expect(
      usd.closest("[data-field-part=\"shell\"]")
        ?.querySelector("[data-field-part$=\"adornment\"]")
    ).not.toBeInTheDocument();

    rerender(
      <AmountInput aria-label="PLN" currency="PLN" locale="pl-PL" value={100} />
    );
    const pln = screen.getByLabelText("PLN");
    expect(pln).toHaveValue("1 zł");
  });

  it("keeps generic adornments separate from the currency affix", () => {
    render(
      <AmountInput
        aria-label="With action"
        currency="USD"
        endAdornment={<button type="button">Calculator</button>}
        locale="en-US"
        value={100}
      />
    );
    expect(screen.getByLabelText("With action")).toHaveValue("$1");
    expect(screen.getByRole("button", { name: "Calculator" })).toBeInTheDocument();
  });

  it("keeps the suffix fixed around Backspace and Delete", async () => {
    const user = userEvent.setup();
    render(
      <AmountInput
        aria-label="Fixed suffix"
        currency="PLN"
        defaultValue={123456}
        locale="pl-PL"
      />
    );
    const input = screen.getByLabelText<HTMLInputElement>("Fixed suffix");
    const suffixStart = input.value.indexOf(" zł");
    input.focus();
    input.setSelectionRange(suffixStart, suffixStart);
    await user.keyboard("{Backspace}");
    expect(input).toHaveValue("1 234,5 zł");
    const nextSuffixStart = input.value.indexOf(" zł");
    input.setSelectionRange(nextSuffixStart, nextSuffixStart);
    await user.keyboard("{Delete}");
    expect(input).toHaveValue("1 234,5 zł");
  });

  it("pastes the configured locale format including currency", async () => {
    const user = userEvent.setup();
    render(
      <AmountInput
        aria-label="Paste amount"
        currency="PLN"
        locale="pl-PL"
      />
    );
    const input = screen.getByLabelText("Paste amount");
    await user.click(input);
    await user.paste("1 234,56 zł");
    expect(input).toHaveValue("1 234,56 zł");
  });

  it("reformats locale and currency changes without changing semantic value", () => {
    const { rerender } = render(
      <AmountInput
        aria-label="Switch format"
        currency="PLN"
        locale="pl-PL"
        value={123456}
      />
    );
    expect(screen.getByLabelText("Switch format")).toHaveValue("1 234,56 zł");

    rerender(
      <AmountInput
        aria-label="Switch format"
        currency="USD"
        locale="en-US"
        value={123456}
      />
    );
    expect(screen.getByLabelText("Switch format")).toHaveValue("$1,234.56");
  });

  it("does not silently reinterpret an external negative value", () => {
    render(
      <AmountInput
        allowNegative={false}
        aria-label="External negative"
        value={-500}
      />
    );
    expect(screen.getByLabelText("External negative")).toHaveValue("-5");
  });

  it("keeps a negative sign editable after a fixed prefix", async () => {
    const user = userEvent.setup();
    render(
      <AmountInput
        allowNegative
        aria-label="Negative dollars"
        currency="USD"
        locale="en-US"
      />
    );
    const input = screen.getByLabelText<HTMLInputElement>("Negative dollars");
    await user.type(input, "-5");
    expect(input).toHaveValue("$-5");
    input.setSelectionRange(2, 2);
    await user.keyboard("{Backspace}");
    expect(input).toHaveValue("$5");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <AmountInput
        currency="EUR"
        hint="Введите сумму платежа"
        id="payment"
        label="Сумма платежа"
        value={1234}
      />
    );
    expect((await axe.run(container)).violations).toEqual([]);
  });
});
