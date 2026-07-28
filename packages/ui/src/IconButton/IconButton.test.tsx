// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import type { FormEvent } from "react";
import styles from "./IconButton.module.css";
import { IconButton } from "./IconButton";

afterEach(cleanup);

function TestIcon() {
  return (
    <svg aria-label="Не использовать как имя" viewBox="0 0 24 24">
      <path d="M4 12h16" />
    </svg>
  );
}

describe("IconButton native semantics", () => {
  it("renders a native button with safe defaults and forwards its ref", () => {
    const ref = { current: null as HTMLButtonElement | null };

    render(
      <IconButton
        aria-label="Обновить"
        data-testid="refresh"
        icon={<TestIcon />}
        ref={ref}
      />
    );

    const button = screen.getByRole("button", { name: "Обновить" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass(styles.ghost, styles.md);
    expect(button).toHaveAttribute("data-testid", "refresh");
    expect(ref.current).toBe(button);
  });

  it("supports aria-labelledby as the accessible-name contract", () => {
    render(
      <>
        <span id="refresh-label">Обновить данные</span>
        <IconButton
          aria-labelledby="refresh-label"
          icon={<TestIcon />}
          variant="secondary"
        />
      </>
    );

    expect(
      screen.getByRole("button", { name: "Обновить данные" })
    ).toBeInTheDocument();
  });

  it("maps all canonical variants and sizes", () => {
    render(
      <>
        <IconButton aria-label="Primary" icon={<TestIcon />} size="sm" variant="primary" />
        <IconButton aria-label="Soft" icon={<TestIcon />} size="lg" variant="soft" />
        <IconButton aria-label="Danger" icon={<TestIcon />} size="md" variant="danger" />
      </>
    );

    expect(screen.getByRole("button", { name: "Primary" })).toHaveClass(styles.primary, styles.sm);
    expect(screen.getByRole("button", { name: "Soft" })).toHaveClass(styles.soft, styles.lg);
    expect(screen.getByRole("button", { name: "Danger" })).toHaveClass(styles.danger, styles.md);
  });
});

describe("IconButton activation", () => {
  it("activates once for pointer, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton
        aria-label="Редактировать"
        icon={<TestIcon />}
        onClick={onClick}
      />
    );

    const button = screen.getByRole("button", { name: "Редактировать" });
    await user.click(button);
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("uses native disabled behavior", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton
        aria-label="Удалить"
        disabled
        icon={<TestIcon />}
        onClick={onClick}
        variant="danger"
      />
    );

    const button = screen.getByRole("button", { name: "Удалить" });
    await user.click(button);
    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("preserves focus and name while loading and suppresses all activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onClickCapture = vi.fn();

    render(
      <IconButton
        aria-label="Синхронизировать"
        icon={<TestIcon />}
        loading
        onClick={onClick}
        onClickCapture={onClickCapture}
        variant="primary"
      />
    );

    const button = screen.getByRole("button", { name: "Синхронизировать" });
    button.focus();
    await user.click(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    button.click();

    expect(onClick).not.toHaveBeenCalled();
    expect(onClickCapture).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    expect(button.querySelector("[data-spinner]")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("prevents native form submission while loading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <IconButton
          aria-label="Отправить"
          icon={<TestIcon />}
          loading
          type="submit"
          variant="primary"
        />
      </form>
    );

    const button = screen.getByRole("button", { name: "Отправить" });
    button.focus();
    await user.click(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    button.click();

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("IconButton accessibility", () => {
  it("keeps the nested icon decorative", () => {
    render(
      <IconButton
        aria-label="Закрыть"
        icon={<TestIcon />}
      />
    );

    expect(screen.getByRole("button", { name: "Закрыть" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Не использовать/ })
    ).not.toBeInTheDocument();
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(
      <div>
        <IconButton aria-label="Поиск" icon={<TestIcon />} />
        <IconButton aria-label="Сохранить" icon={<TestIcon />} variant="primary" />
        <IconButton aria-label="Удалить" icon={<TestIcon />} variant="danger" />
      </div>
    );

    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
