// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useRef, useState } from "react";
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
import type { ModalCloseReason } from "../../modal/types";

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

const originalVisualViewport = window.visualViewport;

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
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: originalVisualViewport
  });
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

function FocusDiscoveryFixture({ explicitInvalid }: { explicitInvalid: boolean }) {
  const hiddenRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      closeLabel="Close focus fixture"
      headerActions={
        <>
          <button hidden ref={hiddenRef}>Hidden control</button>
          <button hidden>Display none control</button>
          <button disabled>Disabled control</button>
          <div inert>
            <button disabled>Inert control</button>
          </div>
          <button>Visible control</button>
        </>
      }
      {...(explicitInvalid ? { initialFocusRef: hiddenRef } : {})}
      onOpenChange={() => undefined}
      open
      title="Focus discovery"
    >
      Body
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

  it("lets Radix discover default focus and ignores an invalid explicit ref", async () => {
    const firstRender = render(
      <FocusDiscoveryFixture explicitInvalid={false} />
    );
    const defaultFocusTarget = await screen.findByRole("button", {
      name: "Visible control"
    });
    await waitFor(() => expect(defaultFocusTarget).toHaveFocus());

    firstRender.unmount();
    render(<FocusDiscoveryFixture explicitInvalid />);
    const invalidRefFallbackTarget = await screen.findByRole("button", {
      name: "Visible control"
    });
    await waitFor(() => expect(invalidRefFallbackTarget).toHaveFocus());
  });

  it("falls back inside the parent modal when the child opener disappears", async () => {
    function MissingOpener() {
      const [childOpen, setChildOpen] = useState(false);
      const [openerVisible, setOpenerVisible] = useState(true);
      return (
        <Drawer
          closeLabel="Close parent"
          onOpenChange={() => undefined}
          open
          title="Focus parent fallback"
        >
          {openerVisible ? (
            <Button onClick={() => setChildOpen(true)} variant="secondary">
              Open child
            </Button>
          ) : null}
          <Dialog
            closeLabel="Close child"
            headerActions={
              <Button
                onClick={() => setOpenerVisible(false)}
                variant="secondary"
              >
                Remove opener
              </Button>
            }
            onOpenChange={setChildOpen}
            open={childOpen}
            title="Focus child fallback"
          >
            Child
          </Dialog>
        </Drawer>
      );
    }

    const user = userEvent.setup();
    render(<MissingOpener />);
    const parent = await screen.findByRole("dialog", {
      name: "Focus parent fallback"
    });
    await user.click(screen.getByRole("button", { name: "Open child" }));
    await screen.findByRole("dialog", { name: "Focus child fallback" });
    await user.click(screen.getByRole("button", { name: "Remove opener" }));
    await user.click(screen.getByRole("button", { name: "Close child" }));
    await waitFor(() => expect(parent).toHaveFocus());
  });

  it("closes backdrop once only after a completed guard pointer sequence", async () => {
    const onClose = vi.fn();
    render(
      <Dialog
        closeLabel="Close"
        onOpenChange={(_nextOpen, meta) => onClose(meta.reason)}
        open
        title="Backdrop owner"
      >
        Content
      </Dialog>
    );
    await screen.findByRole("dialog", { name: "Backdrop owner" });
    const guard = document.querySelector<HTMLElement>("[data-modal-guard]");
    if (!guard) throw new Error("Missing modal guard");

    fireEvent.pointerDown(guard, {
      clientX: 10,
      clientY: 10,
      isPrimary: true,
      pointerId: 41,
      pointerType: "mouse"
    });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerUp(guard, {
      clientX: 10,
      clientY: 10,
      isPrimary: true,
      pointerId: 41,
      pointerType: "mouse"
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledWith("backdrop"));

    fireEvent.pointerDown(document.body, {
      pointerId: 42,
      pointerType: "mouse"
    });
    fireEvent.pointerUp(guard, {
      pointerId: 42,
      pointerType: "mouse"
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("cancels guard-to-content, drag and pointercancel sequences", async () => {
    const onClose = vi.fn();
    render(
      <Dialog
        closeLabel="Close"
        onOpenChange={(_nextOpen, meta) => onClose(meta.reason)}
        open
        title="Cancelled backdrop"
      >
        Modal content
      </Dialog>
    );
    const surface = await screen.findByRole("dialog", {
      name: "Cancelled backdrop"
    });
    const guard = document.querySelector<HTMLElement>("[data-modal-guard]");
    if (!guard) throw new Error("Missing modal guard");

    fireEvent.pointerDown(guard, {
      clientX: 10,
      clientY: 10,
      isPrimary: true,
      pointerId: 51,
      pointerType: "mouse"
    });
    fireEvent.pointerUp(surface, {
      clientX: 10,
      clientY: 10,
      pointerId: 51,
      pointerType: "mouse"
    });

    fireEvent.pointerDown(guard, {
      clientX: 10,
      clientY: 10,
      isPrimary: true,
      pointerId: 52,
      pointerType: "mouse"
    });
    fireEvent.pointerMove(guard, {
      clientX: 40,
      clientY: 40,
      pointerId: 52,
      pointerType: "mouse"
    });
    fireEvent.pointerUp(guard, {
      clientX: 40,
      clientY: 40,
      pointerId: 52,
      pointerType: "mouse"
    });

    fireEvent.pointerDown(guard, {
      isPrimary: true,
      pointerId: 53,
      pointerType: "mouse"
    });
    fireEvent.pointerCancel(guard, {
      pointerId: 53,
      pointerType: "mouse"
    });
    fireEvent.pointerUp(guard, {
      pointerId: 53,
      pointerType: "mouse"
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("blocks Drawer outside pointer without a callback", async () => {
    const onClose = vi.fn();
    render(
      <Drawer
        closeLabel="Close"
        onOpenChange={(_nextOpen, meta) => onClose(meta.reason)}
        open
        title="Blocking Drawer"
      >
        Content
      </Drawer>
    );
    await screen.findByRole("dialog", { name: "Blocking Drawer" });
    const guard = document.querySelector<HTMLElement>("[data-modal-guard]");
    if (!guard) throw new Error("Missing modal guard");
    fireEvent.pointerDown(guard, {
      isPrimary: true,
      pointerId: 61,
      pointerType: "mouse"
    });
    fireEvent.pointerUp(guard, {
      pointerId: 61,
      pointerType: "mouse"
    });
    expect(onClose).not.toHaveBeenCalled();
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

  it("keeps ancestor invalidation exact and never transfers it to a remount", async () => {
    const childAClose = vi.fn();
    const childBClose = vi.fn();

    function AncestorClose() {
      const [parentOpen, setParentOpen] = useState(true);
      const [childKind, setChildKind] = useState<"A" | "B">("A");
      return (
        <>
          <button data-testid="reopen-parent" onClick={() => setParentOpen(true)}>
            Reopen parent
          </button>
          <button data-testid="mount-sibling-b" onClick={() => setChildKind("B")}>
            Mount sibling B
          </button>
          <Drawer
            closeLabel="Закрыть parent"
            onOpenChange={setParentOpen}
            open={parentOpen}
            title="Parent"
          >
            <Dialog
              key={childKind}
              closeLabel="Закрыть child"
              headerActions={
                <Button
                  onClick={() => setParentOpen(false)}
                  variant="secondary"
                >
                  Закрыть ancestor
                </Button>
              }
              onOpenChange={(_nextOpen, meta) => {
                if (childKind === "A") childAClose(meta.reason);
                else childBClose(meta.reason);
              }}
              open
              title={`Child ${childKind}`}
            >
              Child body
            </Dialog>
          </Drawer>
        </>
      );
    }

    const user = userEvent.setup();
    render(<AncestorClose />);
    await screen.findByRole("dialog", { name: "Child A" });
    await user.click(
      screen.getByRole("button", { name: "Закрыть ancestor" })
    );
    await waitFor(() => expect(childAClose).toHaveBeenCalledWith("ancestor"));
    expect(childAClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("mount-sibling-b"));
    fireEvent.click(screen.getByTestId("reopen-parent"));
    expect(await screen.findByRole("dialog", { name: "Child B" }))
      .toBeInTheDocument();
    expect(childBClose).not.toHaveBeenCalled();
    expect(childAClose).toHaveBeenCalledTimes(1);
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

  it("tracks only active VisualViewport height and removes listeners", async () => {
    const viewport = Object.assign(new EventTarget(), {
      height: 640,
      offsetLeft: 0,
      offsetTop: 0,
      onresize: null,
      onscroll: null,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      width: 390
    }) as VisualViewport;
    const removeListener = vi.spyOn(viewport, "removeEventListener");
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: viewport
    });

    const { rerender } = render(
      <BottomSheet
        closeLabel="Close viewport sheet"
        onOpenChange={() => undefined}
        open
        title="Viewport height sheet"
      >
        Input area
      </BottomSheet>
    );
    const surface = await screen.findByRole("dialog", {
      name: "Viewport height sheet"
    });
    await waitFor(() =>
      expect(surface.style.getPropertyValue(
        "--modal-visual-viewport-height"
      )).toBe("640px")
    );

    Object.defineProperty(viewport, "height", {
      configurable: true,
      value: 480
    });
    viewport.dispatchEvent(new Event("resize"));
    await waitFor(() =>
      expect(surface.style.getPropertyValue(
        "--modal-visual-viewport-height"
      )).toBe("480px")
    );

    rerender(
      <BottomSheet
        closeLabel="Close viewport sheet"
        onOpenChange={() => undefined}
        open={false}
        title="Viewport height sheet"
      >
        Input area
      </BottomSheet>
    );
    expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("dismisses a qualifying touch gesture but gives inner scroll priority", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet
        closeLabel="Close sheet"
        onOpenChange={(_nextOpen, meta) => onClose(meta.reason)}
        open
        title="Gesture sheet"
      >
        <div data-testid="nested-scroll">
          <div>Nested swipe body</div>
        </div>
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

    const nestedScroll = screen.getByTestId("nested-scroll");
    nestedScroll.style.overflowY = "auto";
    Object.defineProperties(nestedScroll, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 300 },
      scrollTop: { configurable: true, value: 50, writable: true }
    });

    fireEvent.pointerDown(nestedScroll, {
      clientX: 20,
      clientY: 20,
      isPrimary: true,
      pointerId: 1,
      pointerType: "touch"
    });
    fireEvent.pointerMove(nestedScroll, {
      clientX: 20,
      clientY: 100,
      isPrimary: true,
      pointerId: 1,
      pointerType: "touch"
    });
    fireEvent.pointerUp(nestedScroll, {
      clientX: 20,
      clientY: 100,
      isPrimary: true,
      pointerId: 1,
      pointerType: "touch"
    });
    expect(onClose).not.toHaveBeenCalled();

    nestedScroll.scrollTop = 0;
    fireEvent.pointerDown(nestedScroll, {
      clientX: 20,
      clientY: 20,
      isPrimary: true,
      pointerId: 2,
      pointerType: "touch"
    });
    fireEvent.pointerMove(nestedScroll, {
      clientX: 20,
      clientY: 100,
      isPrimary: true,
      pointerId: 2,
      pointerType: "touch"
    });
    fireEvent.pointerUp(nestedScroll, {
      clientX: 20,
      clientY: 120,
      isPrimary: true,
      pointerId: 2,
      pointerType: "touch"
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledWith("swipe"));
  });

  it("rejects horizontal gestures and resets on pointer cancellation", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet
        closeLabel="Close sheet"
        onOpenChange={(_nextOpen, meta) => onClose(meta.reason)}
        open
        title="Cancelled gesture sheet"
      >
        Swipe body
      </BottomSheet>
    );
    const surface = await screen.findByRole("dialog", {
      name: "Cancelled gesture sheet"
    });

    fireEvent.pointerDown(surface, {
      clientX: 20,
      clientY: 20,
      isPrimary: true,
      pointerId: 71,
      pointerType: "touch"
    });
    fireEvent.pointerMove(surface, {
      clientX: 120,
      clientY: 30,
      isPrimary: true,
      pointerId: 71,
      pointerType: "touch"
    });
    fireEvent.pointerUp(surface, {
      clientX: 120,
      clientY: 80,
      isPrimary: true,
      pointerId: 71,
      pointerType: "touch"
    });

    fireEvent.pointerDown(surface, {
      clientX: 20,
      clientY: 20,
      isPrimary: true,
      pointerId: 72,
      pointerType: "touch"
    });
    fireEvent.pointerMove(surface, {
      clientX: 20,
      clientY: 80,
      isPrimary: true,
      pointerId: 72,
      pointerType: "touch"
    });
    fireEvent.pointerCancel(surface, {
      pointerId: 72,
      pointerType: "touch"
    });
    fireEvent.pointerUp(surface, {
      clientX: 20,
      clientY: 120,
      isPrimary: true,
      pointerId: 72,
      pointerType: "touch"
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
