// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import {
  act,
  cleanup,
  render,
  screen,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Dialog } from "../Dialog/Dialog";
import { Tooltip } from "./Tooltip";

interface MatchMediaController {
  setCompact(compact: boolean): void;
}

function installMatchMedia(initialCompact: boolean): MatchMediaController {
  let compact = initialCompact;
  const listeners = new Set<() => void>();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: (_event: string, listener: () => void) => {
        listeners.add(listener);
      },
      dispatchEvent: () => true,
      matches: query.includes("width <") ? compact : false,
      media: query,
      onchange: null,
      removeEventListener: (_event: string, listener: () => void) => {
        listeners.delete(listener);
      }
    }))
  });
  return {
    setCompact(nextCompact) {
      compact = nextCompact;
      listeners.forEach((listener) => listener());
    }
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Tooltip", () => {
  it("uses tooltip semantics on keyboard focus and consumes Escape", async () => {
    installMatchMedia(false);
    const user = userEvent.setup();
    render(
      <Tooltip content="Keyboard description">
        <button>Справка</button>
      </Tooltip>
    );

    await user.tab();
    const tooltip = await screen.findByRole("tooltip");
    const trigger = screen.getByRole("button", { name: "Справка" });
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("uses existing BottomSheet semantics on compact presentation", async () => {
    installMatchMedia(true);
    const user = userEvent.setup();
    render(
      <DesignSystemProvider locale="ru-RU" mode="light">
        <Tooltip content="Мобильное объяснение">
          <Button variant="secondary">Подробнее</Button>
        </Tooltip>
      </DesignSystemProvider>
    );

    await user.click(screen.getByRole("button", { name: "Подробнее" }));
    expect(await screen.findByRole("dialog", { name: "Подсказка" }))
      .toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(screen.getByRole("button", {
      name: "Закрыть подсказку"
    }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Подсказка" }))
        .not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Подробнее" })).toHaveFocus();
  });

  it("preserves the compact trigger click handler", async () => {
    installMatchMedia(true);
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Tooltip content="Compact content">
        <button onClick={onClick}>Compact trigger</button>
      </Tooltip>
    );

    await user.click(screen.getByRole("button", { name: "Compact trigger" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("dialog", { name: "Tooltip" }))
      .toBeInTheDocument();
  });

  it("creates a normal nested BottomSheet inside Dialog", async () => {
    installMatchMedia(true);
    const user = userEvent.setup();

    function Harness() {
      const [dialogOpen, setDialogOpen] = useState(true);
      return (
        <DesignSystemProvider locale="ru-RU" mode="light">
          <Dialog
            closeLabel="Закрыть parent"
            onOpenChange={setDialogOpen}
            open={dialogOpen}
            title="Parent Dialog"
          >
            <Tooltip content="Nested mobile content">
              <Button variant="secondary">Nested tooltip</Button>
            </Tooltip>
          </Dialog>
        </DesignSystemProvider>
      );
    }

    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Nested tooltip" }));
    expect(await screen.findByRole("dialog", { name: "Подсказка" }))
      .toBeInTheDocument();
    expect(document.querySelectorAll("[data-modal-guard]")).toHaveLength(1);

    await user.click(screen.getByRole("button", {
      name: "Закрыть подсказку"
    }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Подсказка" }))
        .not.toBeInTheDocument();
    });
    expect(screen.getByRole("dialog", { name: "Parent Dialog" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nested tooltip" }))
      .toHaveFocus();
  });

  it("closes without migrating when presentation changes", async () => {
    const media = installMatchMedia(false);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Tooltip content="Boundary content" onOpenChange={onOpenChange}>
        <button>Boundary trigger</button>
      </Tooltip>
    );

    await user.tab();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    onOpenChange.mockClear();

    act(() => media.setCompact(true));

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("dialog", { name: "Tooltip" }))
      .not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: "Boundary trigger" }))
      .toHaveFocus();
  });

  it("does not read browser globals during SSR", () => {
    expect(() => renderToString(
      <Tooltip content="SSR content">
        <button>SSR trigger</button>
      </Tooltip>
    )).not.toThrow();
  });
});
