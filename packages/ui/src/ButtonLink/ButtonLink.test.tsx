// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Button } from "../Button/Button";
import visualStyles from "../Button/buttonVisual.module.css";
import { ButtonLink } from "./ButtonLink";

afterEach(cleanup);

function TestIcon() {
  return (
    <svg aria-label="Декоративная иконка" viewBox="0 0 24 24">
      <path d="M4 12h16" />
    </svg>
  );
}

describe("ButtonLink native semantics", () => {
  it("renders an anchor, requires href and forwards native attributes and ref", () => {
    const ref = { current: null as HTMLAnchorElement | null };

    render(
      <ButtonLink
        data-testid="orders-link"
        download="orders.csv"
        href="/orders"
        ref={ref}
        referrerPolicy="no-referrer"
        target="_blank"
        variant="primary"
      >
        Заказы
      </ButtonLink>
    );

    const link = screen.getByRole("link", { name: "Заказы" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/orders");
    expect(link).toHaveAttribute("download", "orders.csv");
    expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("data-testid", "orders-link");
    expect(ref.current).toBe(link);
  });

  it("uses the exact shared visual classes for variant, size and full width", () => {
    render(
      <ButtonLink fullWidth href="/orders" size="lg" variant="soft">
        Заказы
      </ButtonLink>
    );

    const link = screen.getByRole("link", { name: "Заказы" });
    expect(link).toHaveClass(
      visualStyles.root,
      visualStyles.soft,
      visualStyles.lg,
      visualStyles.fullWidth
    );
  });

  it("normalizes start and end icons through decorative shared slots", () => {
    render(
      <ButtonLink
        endIcon={<TestIcon />}
        href="/details"
        startIcon={<TestIcon />}
        variant="secondary"
      >
        Подробнее
      </ButtonLink>
    );

    expect(screen.getByRole("link", { name: "Подробнее" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Декоративная/ })).not.toBeInTheDocument();
  });

  it("participates in native keyboard focus order", async () => {
    const user = userEvent.setup();
    render(
      <ButtonLink href="/orders" variant="primary">
        Заказы
      </ButtonLink>
    );

    await user.tab();
    expect(screen.getByRole("link", { name: "Заказы" })).toHaveFocus();
  });
});

describe("Button and ButtonLink visual parity", () => {
  it("uses the same canonical visual class source for matching props", () => {
    render(
      <>
        <Button size="md" variant="danger">Удалить</Button>
        <ButtonLink href="/delete" size="md" variant="danger">Удалить через ссылку</ButtonLink>
      </>
    );

    const button = screen.getByRole("button", { name: "Удалить" });
    const link = screen.getByRole("link", { name: "Удалить через ссылку" });
    for (const className of [visualStyles.root, visualStyles.danger, visualStyles.md]) {
      expect(button).toHaveClass(className);
      expect(link).toHaveClass(className);
    }
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(
      <div>
        <ButtonLink href="/orders" variant="primary">Заказы</ButtonLink>
        <ButtonLink href="/archive" variant="secondary">Архив</ButtonLink>
      </div>
    );

    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
