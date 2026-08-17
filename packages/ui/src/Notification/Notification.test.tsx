// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Notification } from "./Notification";
import { NotificationProvider } from "./NotificationProvider";
import { notify } from "./notify";
import type { NotifyOptions } from "./Notification.types";

afterEach(() => {
  notify.dismiss();
  cleanup();
});

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

  it("keeps standalone visual content composable", () => {
    render(
      <Notification
        closeButton={false}
        description={<span><strong>12</strong> заказов</span>}
        title={<span>Связанные записи</span>}
      />
    );
    expect(screen.getByText("Связанные записи")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
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

  it("uses Notification content as the single live-region owner", async () => {
    render(<NotificationProvider />);
    await waitFor(() => {
      expect(document.querySelector("section[data-react-aria-top-layer]"))
        .toHaveAttribute("aria-live", "off");
    });

    notify.success({ title: "Сохранено" });
    const status = await screen.findByRole("status");
    const host = status.closest("section[data-react-aria-top-layer]");
    expect(host).toHaveAttribute("aria-live", "off");
    expect(host).not.toHaveAttribute("aria-live", "polite");
    expect(status.closest("[aria-live=polite], [aria-live=assertive]")).toBeNull();

    notify.error({ id: "assertive", title: "Ошибка" });
    expect(await screen.findByRole("alert")).toHaveTextContent("Ошибка");
  });

  it("warns and ignores a call when the provider is absent", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const id = notify.info({ title: "Не будет показано" });
    expect(id).toMatch(/^notification-missing-provider-/);
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
  });

  it("keeps imperative options text-oriented", () => {
    const richTitle = <span>React node</span>;
    // @ts-expect-error imperative notification titles are intentionally strings
    const options: NotifyOptions = { title: richTitle };
    expect(options.title).toBe(richTitle);
  });
});
