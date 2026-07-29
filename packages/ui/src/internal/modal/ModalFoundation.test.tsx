// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "../../Button/Button";
import { BottomSheet } from "../../BottomSheet/BottomSheet";
import { DesignSystemProvider } from "../../DesignSystemProvider/DesignSystemProvider";
import { Dialog } from "../../Dialog/Dialog";
import { Drawer } from "../../Drawer/Drawer";
import type { ModalCloseReason } from "./types";

class TestPointerEvent extends MouseEvent {
  isPrimary: boolean;
  pointerId: number;
  pointerType: string;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.isPrimary = init.isPrimary ?? false;
    this.pointerId = init.pointerId ?? 0;
    this.pointerType = init.pointerType ?? "";
  }
}

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.PointerEvent = TestPointerEvent as typeof PointerEvent;
  HTMLElement.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-ds-scroll-locked");
  document.documentElement.style.cssText = "";
  document.body.style.cssText = "";
});

function ControlledDialog({
  onReason
}: {
  onReason: (reason: ModalCloseReason) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      closeLabel="Закрыть"
      description="Описание"
      onOpenChange={(nextOpen, meta) => {
        onReason(meta.reason);
        setOpen(nextOpen);
      }}
      open={open}
      title="Заголовок"
    >
      <Button variant="primary">Действие</Button>
    </Dialog>
  );
}

describe("Modal foundation", () => {
  it("renders canonical dialog semantics and reports close-button once", async () => {
    const user = userEvent.setup();
    const onReason = vi.fn();
    render(
      <DesignSystemProvider mode="light">
        <ControlledDialog onReason={onReason} />
      </DesignSystemProvider>
    );

    const dialog = await screen.findByRole("dialog", { name: "Заголовок" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("Описание");
    expect(document.documentElement).toHaveAttribute("data-ds-scroll-locked");

    await user.click(screen.getByRole("button", { name: "Закрыть" }));
    await waitFor(() => expect(onReason).toHaveBeenCalledWith("close-button"));
    expect(onReason).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(document.documentElement).not.toHaveAttribute(
        "data-ds-scroll-locked"
      )
    );
  });

  it("arbitrates Escape to the topmost nested modal only", async () => {
    const user = userEvent.setup();
    const parentClose = vi.fn();
    const childClose = vi.fn();

    function Nested() {
      const [parentOpen, setParentOpen] = useState(true);
      const [childOpen, setChildOpen] = useState(true);
      return (
        <Dialog
          closeLabel="Закрыть parent"
          onOpenChange={(nextOpen, meta) => {
            parentClose(meta.reason);
            setParentOpen(nextOpen);
          }}
          open={parentOpen}
          title="Parent"
        >
          <Dialog
            closeLabel="Закрыть child"
            onOpenChange={(nextOpen, meta) => {
              childClose(meta.reason);
              setChildOpen(nextOpen);
            }}
            open={childOpen}
            title="Child"
          >
            Child body
          </Dialog>
        </Dialog>
      );
    }

    render(<Nested />);
    await screen.findByRole("dialog", { name: "Child" });
    await user.keyboard("{Escape}");
    await waitFor(() => expect(childClose).toHaveBeenCalledWith("escape"));
    expect(parentClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Parent" })).toBeInTheDocument();
  });

  it("invalidates a controlled descendant exactly once", async () => {
    const childClose = vi.fn();
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    function AncestorClose() {
      const [parentOpen, setParentOpen] = useState(true);
      const [childOpen, setChildOpen] = useState(true);
      return (
        <>
          <button data-testid="reopen-parent" onClick={() => setParentOpen(true)}>
            Reopen parent
          </button>
          <button data-testid="ack-child" onClick={() => setChildOpen(false)}>
            Ack child
          </button>
          <button data-testid="reopen-child" onClick={() => setChildOpen(true)}>
            Reopen child
          </button>
          <Drawer
            closeLabel="Закрыть parent"
            onOpenChange={setParentOpen}
            open={parentOpen}
            title="Parent"
          >
            <Dialog
              closeLabel="Закрыть child"
              headerActions={
                <Button
                  onClick={() => setParentOpen(false)}
                  variant="secondary"
                >
                  Закрыть ancestor
                </Button>
              }
              onOpenChange={(_nextOpen, meta) => childClose(meta.reason)}
              open={childOpen}
              title="Child"
            >
              Child body
            </Dialog>
          </Drawer>
        </>
      );
    }

    const user = userEvent.setup();
    render(<AncestorClose />);
    await screen.findByRole("dialog", { name: "Child" });
    await user.click(
      screen.getByRole("button", { name: "Закрыть ancestor" })
    );
    await waitFor(() => expect(childClose).toHaveBeenCalledWith("ancestor"));
    expect(childClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("reopen-parent"));
    expect(await screen.findByRole("dialog", { name: "Parent" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Child" }))
      .not.toBeInTheDocument();
    expect(warning).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("ack-child"));
    fireEvent.click(screen.getByTestId("reopen-child"));
    expect(await screen.findByRole("dialog", { name: "Child" }))
      .toBeInTheDocument();
    expect(childClose).toHaveBeenCalledTimes(1);
  });

  it("does not read DOM globals during SSR", () => {
    expect(() =>
      renderToString(
        <Dialog
          closeLabel="Close"
          onOpenChange={() => undefined}
          open
          title="SSR"
        >
          Body
        </Dialog>
      )
    ).not.toThrow();
  });

  it("dismisses a qualifying touch gesture but gives inner scroll priority", async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <BottomSheet
        closeLabel="Close sheet"
        onOpenChange={(_nextOpen, meta) => onClose(meta.reason)}
        open
        title="Gesture sheet"
      >
        Swipe body
      </BottomSheet>
    );

    const surface = await screen.findByRole("dialog", {
      name: "Gesture sheet"
    });
    vi.spyOn(surface, "getBoundingClientRect").mockReturnValue({
      bottom: 200,
      height: 200,
      left: 0,
      right: 300,
      top: 0,
      width: 300,
      x: 0,
      y: 0,
      toJSON: () => undefined
    });

    fireEvent.pointerDown(surface, {
      clientX: 20,
      clientY: 20,
      isPrimary: true,
      pointerId: 1,
      pointerType: "touch"
    });
    fireEvent.pointerMove(surface, {
      clientX: 20,
      clientY: 100,
      isPrimary: true,
      pointerId: 1,
      pointerType: "touch"
    });
    fireEvent.pointerUp(surface, {
      clientX: 20,
      clientY: 100,
      isPrimary: true,
      pointerId: 1,
      pointerType: "touch"
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledWith("swipe"));

    onClose.mockClear();
    rerender(
      <BottomSheet
        closeLabel="Close sheet"
        onOpenChange={(_nextOpen, meta) => onClose(meta.reason)}
        open
        title="Gesture sheet"
      >
        Swipe body
      </BottomSheet>
    );
    const scrollBody = screen.getByText("Swipe body").closest(
      "[data-modal-scroll-container]"
    );
    if (!scrollBody) throw new Error("Missing modal scroll container");
    expect(scrollBody).toHaveAttribute("data-modal-scroll-container");
    Object.defineProperty(scrollBody, "scrollTop", {
      configurable: true,
      value: 50
    });
    fireEvent.pointerDown(scrollBody as HTMLElement, {
      clientX: 20,
      clientY: 20,
      isPrimary: true,
      pointerId: 2,
      pointerType: "touch"
    });
    fireEvent.pointerUp(scrollBody as HTMLElement, {
      clientX: 20,
      clientY: 120,
      isPrimary: true,
      pointerId: 2,
      pointerType: "touch"
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
