// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ModalHeaderActions } from "./ModalHeaderActions";

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  window.scrollTo = vi.fn();
});

function setCompact(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      addEventListener: vi.fn(),
      matches,
      media: "(width < 768px)",
      removeEventListener: vi.fn()
    }))
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia
  });
});

describe("Modal header chrome", () => {
  it("delegates desktop actions and confirmation to ActionMenu", async () => {
    setCompact(false);
    const remove = vi.fn();
    render(
      <ModalHeaderActions
        actions={[{
          id: "delete",
          label: "Удалить",
          tone: "danger",
          confirmation: {
            title: "Удалить запись?",
            confirmLabel: "Удалить",
            cancelLabel: "Отмена"
          },
          onSelect: remove
        }]}
        closeLabel="Закрыть действия"
        label="Ещё действия"
        title="Действия"
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Ещё действия" }));
    const menu = await screen.findByRole("menu");
    await user.click(screen.getByRole("menuitem", { name: "Удалить" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(menu.parentElement).toContainElement(screen.getByRole("alertdialog"));
    expect(screen.getByRole("alertdialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Отмена" }));
    expect(screen.getByRole("menuitem", { name: "Удалить" })).toBeVisible();
    expect(remove).not.toHaveBeenCalled();
  });

  it("prevents repeated selection while an async action is pending", async () => {
    setCompact(false);
    let resolve!: () => void;
    const action = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    render(
      <ModalHeaderActions
        actions={[{ id: "archive", label: "Архивировать", onSelect: action }]}
        closeLabel="Закрыть действия"
        label="Ещё действия"
        title="Действия"
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Ещё действия" }));
    const item = screen.getByRole("menuitem", { name: "Архивировать" });
    await user.dblClick(item);
    expect(action).toHaveBeenCalledOnce();
    expect(item).toBeDisabled();
    resolve();
    await waitFor(() => expect(screen.queryByRole("menuitem")).not.toBeInTheDocument());
  });

  it("uses a nested BottomSheet on compact viewports", async () => {
    setCompact(true);
    render(
      <ModalHeaderActions
        actions={[{ id: "copy", label: "Копировать", onSelect: vi.fn() }]}
        closeLabel="Закрыть действия"
        label="Ещё действия"
        title="Действия"
      />
    );
    const user = userEvent.setup();
    await waitFor(() => expect(window.matchMedia).toHaveBeenCalled());
    await user.click(screen.getByRole("button", { name: "Ещё действия" }));
    expect(await screen.findByRole("dialog", { name: "Действия" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Копировать" })).toBeVisible();
  });
});
