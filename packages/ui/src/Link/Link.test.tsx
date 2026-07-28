// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Link } from "./Link";
import { LinkButton } from "./LinkButton";

afterEach(cleanup);

describe("Link navigation semantics", () => {
  it("renders a native anchor with a real href", () => {
    render(<Link href="/orders">Заказы</Link>);

    const link = screen.getByRole("link", { name: "Заказы" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/orders");
  });

  it("marks external destinations without forcing a new browsing context", () => {
    render(<Link external href="https://example.com">Документация</Link>);

    const link = screen.getByRole("link", { name: "Документация" });
    expect(link).toHaveAttribute("rel", "external");
    expect(link).not.toHaveAttribute("target");
  });
});

describe("LinkButton action semantics", () => {
  it("renders a native button and activates by keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<LinkButton onClick={onClick}>Обновить</LinkButton>);
    const button = screen.getByRole("button", { name: "Обновить" });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");

    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("uses native disabled behavior", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<LinkButton disabled onClick={onClick}>Недоступно</LinkButton>);
    const button = screen.getByRole("button", { name: "Недоступно" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(
      <div>
        <Link href="/orders">Открыть заказы</Link>
        <LinkButton>Повторить запрос</LinkButton>
      </div>
    );

    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
