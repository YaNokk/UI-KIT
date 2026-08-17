// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Notification } from "./Notification";
import { notify } from "./notify";

afterEach(cleanup);

describe("Notification", () => {
  it.each(["success", "warning", "info", "neutral"] as const)(
    "uses polite status semantics for %s",
    (variant) => {
      render(<Notification closeButton={false} title="Готово" variant={variant} />);
      expect(screen.getByRole("status")).toHaveAttribute("data-variant", variant);
    }
  );

  it("uses assertive semantics for an error", () => {
    render(<Notification closeButton={false} title="Не удалось сохранить" variant="error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Не удалось сохранить");
  });

  it("keeps action and close controls keyboard accessible", async () => {
    const action = vi.fn();
    const close = vi.fn();
    const user = userEvent.setup();
    render(
      <Notification
        action={{ label: "Повторить", onClick: action }}
        onClose={close}
        title="Ошибка"
        variant="error"
      />
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "Повторить" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(action).toHaveBeenCalledOnce();
    await user.tab();
    expect(screen.getByRole("button", { name: "Закрыть уведомление" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(close).toHaveBeenCalledOnce();
  });

  it("hides progress for persistent notifications and has no axe violations", async () => {
    const { container } = render(
      <Notification description="Проверьте подключение" persistent title="Нет сети" variant="warning" />
    );
    expect(container.querySelector("[class*=progressTrack]")).not.toBeInTheDocument();
    expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });
});

describe("notify API", () => {
  it("keeps Sonner-specific API private", () => {
    expect(notify).toEqual(expect.any(Function));
    expect(notify.success).toEqual(expect.any(Function));
    expect(notify.error).toEqual(expect.any(Function));
    expect(notify.warning).toEqual(expect.any(Function));
    expect(notify.info).toEqual(expect.any(Function));
    expect(notify.neutral).toEqual(expect.any(Function));
    expect(notify.dismiss).toEqual(expect.any(Function));
    expect(notify).not.toHaveProperty("promise");
  });
});
