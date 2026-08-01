// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import type { FormEvent } from "react";
import { Button } from "./Button";

afterEach(cleanup);

function TestIcon() {
  return (
    <svg aria-label="Не должно участвовать в имени" viewBox="0 0 24 24">
      <path d="M12 4v16M4 12h16" />
    </svg>
  );
}

describe("Button native semantics", () => {
  it.each([
    ["sm", "controlTextSm"],
    ["md", "controlTextMd"],
    ["lg", "controlTextLg"]
  ] as const)("maps %s to the exact typography role %s", (size, role) => {
    const { container } = render(<Button size={size} variant="primary">Label</Button>);
    expect(container.querySelector("[data-control-text]"))
      .toHaveAttribute("data-control-text-role", role);
  });

  it("renders a native button with safe defaults and forwards its ref", () => {
    const ref = { current: null as HTMLButtonElement | null };

    render(
      <Button data-testid="button" ref={ref} variant="secondary">
        Сохранить
      </Button>
    );

    const button = screen.getByRole("button", { name: "Сохранить" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-testid", "button");
    expect(button.querySelector("[data-control-text]")).toHaveTextContent("Сохранить");
    expect(ref.current).toBe(button);
  });

  it("supports explicit submit and reset behavior", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const onReset = vi.fn();

    render(
      <form onReset={onReset} onSubmit={onSubmit}>
        <Button type="submit" variant="primary">
          Отправить
        </Button>
        <Button type="reset" variant="secondary">
          Сбросить
        </Button>
      </form>
    );

    await user.click(screen.getByRole("button", { name: "Отправить" }));
    await user.click(screen.getByRole("button", { name: "Сбросить" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe("Button activation", () => {
  it("activates exactly once by mouse, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button onClick={onClick} variant="primary">
        Продолжить
      </Button>
    );

    const button = screen.getByRole("button", { name: "Продолжить" });

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    button.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);

    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("does not activate when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick} variant="danger">
        Удалить
      </Button>
    );

    const button = screen.getByRole("button", { name: "Удалить" });
    await user.click(button);
    button.click();

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("blocks mouse, keyboard, programmatic click and submit while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onClickCapture = vi.fn();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <Button
          loading
          onClick={onClick}
          onClickCapture={onClickCapture}
          type="submit"
          variant="primary"
        >
          Оплатить
        </Button>
      </form>
    );

    const button = screen.getByRole("button", { name: "Оплатить" });
    button.focus();

    await user.click(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    button.click();

    expect(onClick).not.toHaveBeenCalled();
    expect(onClickCapture).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    expect(button.querySelector("[data-spinner]")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });
});

describe("Button loading transition", () => {
  it("preserves focus, accessible name and layout content across idle-loading-idle", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const renderButton = (loading: boolean) => (
      <Button
        loading={loading}
        onClick={onClick}
        startIcon={<TestIcon />}
        variant="primary"
      >
        Сохранить изменения
      </Button>
    );
    const view = render(renderButton(false));
    const button = screen.getByRole("button", { name: "Сохранить изменения" });

    button.focus();
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    view.rerender(renderButton(true));
    expect(screen.getByRole("button", { name: "Сохранить изменения" })).toBe(button);
    expect(button).toHaveFocus();
    expect(screen.getByText("Сохранить изменения")).toBeInTheDocument();

    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);

    view.rerender(renderButton(false));
    expect(screen.getByRole("button", { name: "Сохранить изменения" })).toBe(button);
    expect(button).toHaveFocus();

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe("Button accessibility", () => {
  it("keeps decorative icons out of the accessible name", () => {
    render(
      <Button
        endIcon={<TestIcon />}
        startIcon={<TestIcon />}
        variant="secondary"
      >
        Добавить
      </Button>
    );

    expect(screen.getByRole("button", { name: "Добавить" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Не должно участвовать/ })
    ).not.toBeInTheDocument();
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Сохранить</Button>
        <Button disabled variant="secondary">Недоступно</Button>
        <Button variant="soft">Подробнее</Button>
        <Button loading variant="danger">Удаление</Button>
      </div>
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false }
      }
    });
    expect(results.violations).toEqual([]);
  });
});
