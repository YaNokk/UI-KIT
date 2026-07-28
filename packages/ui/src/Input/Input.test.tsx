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
    const onChange = vi.fn();

    render(
      <Input
        autoComplete="email"
        data-testid="email"
        id="email"
        inputMode="email"
        label="Email"
        name="email"
        onChange={onChange}
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

  it("wires required, invalid, description and caller aria-describedby", () => {
    render(
      <>
        <span id="external">External</span>
        <Input
          aria-describedby="external"
          description="Подсказка"
          error="Ошибка"
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
      "external name-description name-error"
    );
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
