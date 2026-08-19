// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Drawer } from "../Drawer/Drawer";
import { ActionMenu } from "./ActionMenu";

interface MatchMediaController {
  setCompact(compact: boolean): void;
}

function installMatchMedia(initialCompact: boolean): MatchMediaController {
  let compact = initialCompact;
  const listeners = new Set<() => void>();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
      dispatchEvent: () => true,
      matches: query.includes("width <") ? compact : false,
      media: query,
      onchange: null,
      removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener)
    }))
  });
  return {
    setCompact(nextCompact) {
      compact = nextCompact;
      listeners.forEach((listener) => listener());
    }
  };
}

beforeEach(() => {
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ActionMenu", () => {
  it("opens an anchored command menu and implements roving keyboard focus", async () => {
    installMatchMedia(false);
    const copy = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionMenu
        actions={[
          { id: "print", label: "Печать", disabled: true, onSelect: vi.fn() },
          { id: "copy", label: "Копировать", onSelect: copy },
          { id: "archive", label: "Архивировать", onSelect: vi.fn() }
        ]}
        trigger={<button>Действия</button>}
      />
    );

    const trigger = screen.getByRole("button", { name: "Действия" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await user.click(trigger);
    expect(await screen.findByRole("menu")).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Печать" })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Копировать" })).toHaveFocus());
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Архивировать" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Копировать" })).toHaveFocus();
    await user.keyboard(" ");
    expect(copy).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape and outside press", async () => {
    installMatchMedia(false);
    const user = userEvent.setup();
    render(
      <div>
        <ActionMenu
          actions={[{ id: "copy", label: "Копировать", onSelect: vi.fn() }]}
          trigger={<button>Действия</button>}
        />
        <button>Снаружи</button>
      </div>
    );
    const trigger = screen.getByRole("button", { name: "Действия" });
    await user.click(trigger);
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Снаружи" }));
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("keeps destructive confirmation in the same surface", async () => {
    installMatchMedia(false);
    const remove = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionMenu
        actions={[{
          id: "delete",
          label: "Удалить",
          tone: "danger",
          confirmation: {
            title: "Удалить запись?",
            description: "Действие нельзя отменить.",
            confirmLabel: "Удалить",
            cancelLabel: "Отмена"
          },
          onSelect: remove
        }]}
        trigger={<button>Действия</button>}
      />
    );
    await user.click(screen.getByRole("button", { name: "Действия" }));
    const surface = document.querySelector("[data-action-menu-surface]");
    await user.click(screen.getByRole("menuitem", { name: "Удалить" }));
    expect(surface).toContainElement(screen.getByRole("alertdialog"));
    await user.click(screen.getByRole("button", { name: "Отмена" }));
    expect(screen.getByRole("menuitem", { name: "Удалить" })).toBeVisible();
    await user.click(screen.getByRole("menuitem", { name: "Удалить" }));
    await user.click(screen.getByRole("button", { name: "Удалить" }));
    expect(remove).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("blocks duplicate async selection and closes only after success", async () => {
    installMatchMedia(false);
    let resolve!: () => void;
    const select = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const user = userEvent.setup();
    render(
      <ActionMenu
        actions={[{ id: "archive", label: "Архивировать", onSelect: select }]}
        trigger={<button>Действия</button>}
      />
    );
    await user.click(screen.getByRole("button", { name: "Действия" }));
    const item = screen.getByRole("menuitem", { name: "Архивировать" });
    await user.dblClick(item);
    expect(select).toHaveBeenCalledOnce();
    expect(item).toBeDisabled();
    resolve();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("reports a rejected action, keeps the menu open and permits retry", async () => {
    installMatchMedia(false);
    const error = new Error("archive failed");
    const action = {
      id: "archive",
      label: "Архивировать",
      onSelect: vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(undefined)
    };
    const onActionError = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionMenu
        actions={[action]}
        onActionError={onActionError}
        trigger={<button>Действия</button>}
      />
    );
    await user.click(screen.getByRole("button", { name: "Действия" }));
    const item = screen.getByRole("menuitem", { name: "Архивировать" });
    await user.click(item);
    await waitFor(() => expect(onActionError).toHaveBeenCalledOnce());
    expect(onActionError).toHaveBeenCalledWith(error, action);
    expect(screen.getByRole("menu")).toBeVisible();
    expect(item).toBeEnabled();
    await user.click(item);
    expect(action.onSelect).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(onActionError).toHaveBeenCalledOnce();
  });

  it("consumes a rejected action safely when no error callback is provided", async () => {
    installMatchMedia(false);
    const user = userEvent.setup();
    render(
      <ActionMenu
        actions={[{
          id: "copy",
          label: "Копировать",
          onSelect: () => Promise.reject(new Error("copy failed"))
        }]}
        trigger={<button>Действия</button>}
      />
    );
    await user.click(screen.getByRole("button", { name: "Действия" }));
    const item = screen.getByRole("menuitem", { name: "Копировать" });
    await user.click(item);
    await waitFor(() => expect(item).toBeEnabled());
    expect(screen.getByRole("menu")).toBeVisible();
  });

  it("uses one localized BottomSheet on compact viewports", async () => {
    installMatchMedia(true);
    const user = userEvent.setup();
    render(
      <DesignSystemProvider locale="kk-KZ" mode="light">
        <ActionMenu
          actions={[{ id: "copy", label: "Көшіру", onSelect: vi.fn() }]}
          trigger={<Button variant="secondary">Ашу</Button>}
        />
      </DesignSystemProvider>
    );
    const trigger = screen.getByRole("button", { name: "Ашу" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(trigger);
    expect(await screen.findByRole("dialog", { name: "Әрекеттер" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Көшіру" })).toBeVisible();
    expect(screen.queryByTestId("floating-menu")).not.toBeInTheDocument();
    expect(document.querySelector("[data-action-menu-surface]")).toBeNull();
    expect(screen.getByRole("button", { name: "Әрекеттерді жабу" })).toBeVisible();
  });

  it("uses a labelled region for compact confirmation without nesting a dialog", async () => {
    installMatchMedia(true);
    const user = userEvent.setup();
    render(
      <ActionMenu
        actions={[{
          id: "delete",
          label: "Удалить",
          tone: "danger",
          confirmation: {
            title: "Удалить запись?",
            confirmLabel: "Удалить",
            cancelLabel: "Отмена"
          },
          onSelect: vi.fn()
        }]}
        title="Действия"
        trigger={<button>Действия записи</button>}
      />
    );
    await user.click(screen.getByRole("button", { name: "Действия записи" }));
    await user.click(await screen.findByRole("menuitem", { name: "Удалить" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Удалить запись?" })).toBeVisible();
  });

  it("closes once without migrating when the presentation changes", async () => {
    const media = installMatchMedia(false);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionMenu
        actions={[{ id: "copy", label: "Copy", onSelect: vi.fn() }]}
        onOpenChange={onOpenChange}
        trigger={<button>Actions</button>}
      />
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    onOpenChange.mockClear();
    act(() => media.setCompact(true));
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(screen.queryByRole("dialog", { name: "Actions" })).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not open from a disabled trigger", async () => {
    installMatchMedia(true);
    const user = userEvent.setup();
    render(
      <ActionMenu
        actions={[{ id: "copy", label: "Copy", onSelect: vi.fn() }]}
        trigger={<button disabled>Actions</button>}
      />
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("registers a compact menu as one nested modal branch inside Drawer", async () => {
    installMatchMedia(true);
    const user = userEvent.setup();
    render(
      <Drawer closeLabel="Закрыть Drawer" onOpenChange={() => undefined} open title="Заказ">
        <ActionMenu
          actions={[{ id: "copy", label: "Копировать", onSelect: vi.fn() }]}
          trigger={<button>Действия заказа</button>}
        />
      </Drawer>
    );
    await user.click(screen.getByRole("button", { name: "Действия заказа" }));
    expect(await screen.findByRole("dialog", { name: "Действия" })).toBeVisible();
    expect(document.querySelectorAll("[data-modal-guard]")).toHaveLength(1);
  });

  it("uses the floating server snapshot during SSR", () => {
    expect(() => renderToString(
      <ActionMenu
        actions={[{ id: "copy", label: "Copy", onSelect: () => undefined }]}
        trigger={<button>Actions</button>}
      />
    )).not.toThrow();
  });
});
