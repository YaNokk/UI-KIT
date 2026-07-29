// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PasswordInput } from "./PasswordInput";

afterEach(cleanup);

describe("PasswordInput", () => {
  it("toggles visibility without changing the value", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        autoComplete="current-password"
        defaultValue="secret"
        label="Пароль"
      />
    );

    const input = screen.getByLabelText("Пароль");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "current-password");

    const toggle = screen.getByRole("button", { name: "Показать пароль" });
    await user.click(toggle);
    expect(toggle).toHaveFocus();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("secret");

    await user.click(screen.getByRole("button", { name: "Скрыть пароль" }));
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("secret");
  });

  it("supports controlled visibility", async () => {
    const user = userEvent.setup();
    const onVisibleChange = vi.fn();
    function Controlled() {
      const [visible, setVisible] = useState(false);
      return (
        <PasswordInput
          aria-label="Пароль"
          onVisibleChange={(next) => {
            onVisibleChange(next);
            setVisible(next);
          }}
          visible={visible}
        />
      );
    }

    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Показать пароль" }));
    expect(onVisibleChange).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText("Пароль")).toHaveAttribute("type", "text");
  });

  it("supports native keyboard activation and logical focus order", async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Пароль" />);

    await user.tab();
    expect(screen.getByLabelText("Пароль")).toHaveFocus();
    await user.tab();
    const toggle = screen.getByRole("button", { name: "Показать пароль" });
    expect(toggle).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("Пароль")).toHaveAttribute("type", "text");
    await user.keyboard(" ");
    expect(screen.getByLabelText("Пароль")).toHaveAttribute("type", "password");
  });

  it("disables both input and visibility action", () => {
    render(<PasswordInput disabled label="Пароль" />);
    expect(screen.getByLabelText("Пароль")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Показать пароль" })).toBeDisabled();
  });

  it("forwards the native input ref", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<PasswordInput aria-label="Пароль" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText("Пароль"));
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(
      <PasswordInput error="Введите пароль" label="Пароль" required />
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
