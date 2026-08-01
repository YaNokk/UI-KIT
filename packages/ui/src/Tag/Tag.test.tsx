// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import styles from "./Tag.module.css";
import { Tag } from "./Tag";

afterEach(cleanup);

describe("Tag modes", () => {
  it("renders a static non-focusable span", () => {
    render(<Tag color="green">Выполнен</Tag>);
    const tag = screen.getByText("Выполнен").closest("span");

    expect(tag?.parentElement).toHaveClass(styles.root);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a selectable toggle with native keyboard behavior", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <Tag color="blue" onClick={onClick} selected={false}>Активные</Tag>
    );
    const button = screen.getByRole("button", { name: "Активные" });

    expect(button).toHaveAttribute("aria-pressed", "false");
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);

    rerender(<Tag color="blue" onClick={onClick} selected>Активные</Tag>);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass(styles.selected);
  });

  it("uses one accessible removal control", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const { container } = render(
      <Tag color="purple" onRemove={onRemove} removeLabel="Удалить тег Design">
        Design
      </Tag>
    );
    const button = screen.getByRole("button", { name: "Удалить тег Design" });

    expect(container.querySelectorAll("button")).toHaveLength(1);
    button.focus();
    await user.keyboard("{Enter}");
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("keeps interactive disabled tags inert and out of tab order", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag disabled onClick={onClick} selected={false}>Недоступно</Tag>);
    const button = screen.getByRole("button", { name: "Недоступно" });

    expect(button).toBeDisabled();
    await user.tab();
    expect(button).not.toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps an embedded status dot decorative", () => {
    const { container } = render(<Tag color="green" dot>Online</Tag>);
    expect(container.querySelector("[data-status-indicator]"))
      .toHaveAttribute("aria-hidden", "true");
  });
});

describe("Tag accessibility", () => {
  it("has no detectable axe violations", async () => {
    const { container } = render(
      <div>
        <Tag color="green" dot>Online</Tag>
        <Tag onClick={() => undefined} selected>Выбрано</Tag>
        <Tag onRemove={() => undefined} removeLabel="Удалить тег QA">QA</Tag>
      </div>
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
