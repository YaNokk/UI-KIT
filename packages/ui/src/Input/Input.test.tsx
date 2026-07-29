// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

afterEach(cleanup);

describe("Input native behavior", () => {
  it("forwards native attributes, events and the input ref", async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLInputElement | null };
    const onBlur = vi.fn();
    const onChange = vi.fn();
    const onFocus = vi.fn();

    render(
      <Input
        autoComplete="email"
        data-testid="email"
        id="email"
        inputMode="email"
        label="Email"
        name="email"
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        placeholder="name@example.com"
        ref={ref}
        type="email"
      />
    );

    const input = screen.getByLabelText("Email");
    await user.type(input, "a");
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveAttribute("inputmode", "email");
    expect(input).toHaveAttribute("data-testid", "email");
    expect(onChange).toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalled();
    input.blur();
    expect(onBlur).toHaveBeenCalled();
  });

  it("supports normal controlled and uncontrolled usage", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("one");
      return (
        <Input
          aria-label="Controlled"
          onChange={(event) => setValue(event.currentTarget.value)}
          value={value}
        />
      );
    }

    render(
      <>
        <Controlled />
        <Input aria-label="Uncontrolled" defaultValue="start" />
      </>
    );

    await user.clear(screen.getByLabelText("Controlled"));
    await user.type(screen.getByLabelText("Controlled"), "two");
    await user.type(screen.getByLabelText("Uncontrolled"), "-end");
    expect(screen.getByLabelText("Controlled")).toHaveValue("two");
    expect(screen.getByLabelText("Uncontrolled")).toHaveValue("start-end");
  });

  it("wires required and lets error replace hint in aria-describedby", () => {
    render(
      <>
        <span id="external">External</span>
        <Input
          aria-describedby="external"
          error="Ошибка"
          hint="Подсказка"
          id="name"
          label="Имя"
          required
        />
      </>
    );

    const input = screen.getByRole("textbox", { name: "Имя" });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "external name-error"
    );
    expect(screen.queryByText("Подсказка")).not.toBeInTheDocument();
  });

  it("keeps disabled and readOnly native semantics distinct", () => {
    render(
      <>
        <Input aria-label="Disabled" disabled />
        <Input aria-label="Read only" readOnly value="Readable" onChange={() => undefined} />
      </>
    );

    expect(screen.getByLabelText("Disabled")).toBeDisabled();
    expect(screen.getByLabelText("Read only")).not.toBeDisabled();
    expect(screen.getByLabelText("Read only")).toHaveAttribute("readonly");
  });

  it("renders generic adornments", () => {
    render(
      <Input
        aria-label="Цена"
        endAdornment={<button type="button">Валюта</button>}
        startAdornment={<span>от</span>}
      />
    );

    expect(screen.getByText("от")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Валюта" })).toBeInTheDocument();
  });

  it("uses native focus for content and delegates decorative adornment clicks", async () => {
    const user = userEvent.setup();
    render(
      <Input
        endAdornment={<span>kg</span>}
        label="Вес"
        startAdornment={<span>≈</span>}
      />
    );
    const input = screen.getByRole("textbox", { name: "Вес" });
    const shell = input.closest("[data-label-view]");
    if (!shell) throw new Error("FieldShell was not rendered.");
    expect(input).toHaveAttribute("data-field-part", "native-control");

    await user.click(input);
    expect(input).toHaveFocus();
    input.blur();
    await user.click(screen.getByText("≈"));
    expect(input).toHaveFocus();
    input.blur();
    await user.click(screen.getByText("kg"));
    expect(input).toHaveFocus();
  });

  it("uses native label/htmlFor focus for outer and inner labels", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Input id="outer-field" label="Outer semantic label" />
        <Input id="inner-field" label="Inner semantic label" labelView="inner" />
      </>
    );

    const outerInput = screen.getByRole("textbox", { name: "Outer semantic label" });
    const innerInput = screen.getByRole("textbox", { name: "Inner semantic label" });
    const outerLabel = screen.getByText("Outer semantic label", { selector: "label" });
    const innerLabel = screen.getByText("Inner semantic label", { selector: "label" });

    expect(outerLabel).toHaveAttribute("for", "outer-field");
    expect(innerLabel).toHaveAttribute("for", "inner-field");
    expect(outerInput).not.toHaveAttribute("label");
    expect(innerInput).not.toHaveAttribute("label");
    await user.click(outerLabel);
    expect(outerInput).toHaveFocus();
    await user.click(innerLabel);
    expect(innerInput).toHaveFocus();
  });

  it("floats an inner semantic label on focus and content", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Input label="Название" labelView="inner" placeholder="Введите название" />
    );
    const input = screen.getByRole("textbox", { name: "Название" });
    const shell = input.closest("[data-label-view]");
    if (!shell) throw new Error("FieldShell was not rendered.");
    expect(shell).toHaveAttribute("data-label-view", "inner");
    expect(shell).not.toHaveAttribute("data-label-floated");
    expect(input).not.toHaveAttribute("data-label-floated");

    await user.click(screen.getByText("Название", { selector: "label" }));
    expect(input).toHaveFocus();
    expect(shell).toHaveAttribute("data-label-floated");

    await user.type(input, "Товар");
    input.blur();
    expect(shell).toHaveAttribute("data-label-floated");

    rerender(
      <Input
        key="controlled-empty"
        label="Название"
        labelView="inner"
        onChange={() => undefined}
        placeholder="Введите название"
        value=""
      />
    );
    const controlledInput = screen.getByRole("textbox", { name: "Название" });
    expect(controlledInput.closest("[data-label-view]"))
      .not.toHaveAttribute("data-label-floated");
  });

  it("updates inner-label content state from React-controlled values", async () => {
    const user = userEvent.setup();
    function ControlledInner() {
      const [value, setValue] = useState("");
      return (
        <>
          <Input
            label="Код"
            labelView="inner"
            onChange={(event) => setValue(event.currentTarget.value)}
            value={value}
          />
          <button onClick={() => setValue("remote")} type="button">
            Установить значение
          </button>
        </>
      );
    }

    render(<ControlledInner />);
    const input = screen.getByRole("textbox", { name: "Код" });
    const shell = input.closest("[data-label-view]");
    expect(shell).not.toHaveAttribute("data-label-floated");
    await user.click(screen.getByRole("button", { name: "Установить значение" }));
    expect(input).toHaveValue("remote");
    expect(shell).toHaveAttribute("data-label-floated");
  });

  it("has no detectable axe violations in required and error states", async () => {
    const { container } = render(
      <Input error="Введите значение" label="Название" required />
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
