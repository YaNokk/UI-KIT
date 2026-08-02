// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  createRef,
  useRef,
  type MouseEventHandler,
  type RefObject
} from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveSelectMessages } from "./messages";
import { SelectPanel } from "./SelectPanel";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function LifecycleFixture({
  open,
  triggerRef,
  version
}: {
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  version: string;
}) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  return (
    <div data-lifecycle-shell="" ref={shellRef}>
      <SelectPanel
        focusTriggerRef={triggerRef}
        geometryReferenceRef={shellRef}
        interactive
        messages={resolveSelectMessages("en-US")}
        multiple={false}
        onOpenChange={() => undefined}
        open={open}
        trigger={<button key={version} type="button">{`Trigger ${version}`}</button>}
        triggerRef={triggerRef}
      >
        <div role="listbox">Options</div>
      </SelectPanel>
    </div>
  );
}

describe("SelectPanelTriggerRefLifecycle", () => {
  it("PopupReferenceReplacement focuses only the mounted replacement on close", () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const view = render(
      <LifecycleFixture open triggerRef={triggerRef} version="first" />
    );
    const shell = view.container.querySelector<HTMLElement>("[data-lifecycle-shell]");
    const first = screen.getByRole("button", { name: "Trigger first" });
    const firstFocus = vi.spyOn(first, "focus");
    expect(triggerRef.current).toBe(first);

    view.rerender(
      <LifecycleFixture open triggerRef={triggerRef} version="second" />
    );
    const second = screen.getByRole("button", { name: "Trigger second" });
    expect(view.container.querySelector("[data-lifecycle-shell]")).toBe(shell);
    expect(first.isConnected).toBe(false);
    expect(triggerRef.current).toBe(second);

    view.rerender(
      <LifecycleFixture open={false} triggerRef={triggerRef} version="second" />
    );
    expect(second).toHaveFocus();
    expect(firstFocus).not.toHaveBeenCalled();
  });

  it("PopupReferenceUnmountCleanup clears the interactive trigger ref", () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const view = render(
      <LifecycleFixture open triggerRef={triggerRef} version="mounted" />
    );
    const trigger = screen.getByRole("button", { name: "Trigger mounted" });
    const focus = vi.spyOn(trigger, "focus");
    expect(triggerRef.current).toBe(trigger);

    view.unmount();

    expect(triggerRef.current).toBeNull();
    expect(trigger.isConnected).toBe(false);
    expect(focus).not.toHaveBeenCalled();
  });
});

describe("SelectPanel shared pointer-toggle contract", () => {
  const renderPanel = ({
    consumerOnClick,
    interactive = true,
    onOpenChange,
    open = false
  }: {
    consumerOnClick?: MouseEventHandler<HTMLButtonElement>;
    interactive?: boolean;
    onOpenChange: (open: boolean) => void;
    open?: boolean;
  }) => render(
    <SelectPanel
      interactive={interactive}
      messages={resolveSelectMessages("en-US")}
      multiple={false}
      onOpenChange={onOpenChange}
      open={open}
      trigger={(
        <button onClick={consumerOnClick} type="button">
          Shared trigger
        </button>
      )}
    >
      <div role="listbox">Options</div>
    </SelectPanel>
  );

  it("composes the consumer click before one shared state transition", () => {
    const calls: string[] = [];
    renderPanel({
      consumerOnClick: () => calls.push("consumer"),
      onOpenChange: (open) => calls.push(`open:${String(open)}`)
    });

    fireEvent.click(screen.getByRole("button", { name: "Shared trigger" }));

    expect(calls).toEqual(["consumer", "open:true"]);
  });

  it("honors consumer defaultPrevented", () => {
    const onOpenChange = vi.fn();
    renderPanel({
      consumerOnClick: (event) => event.preventDefault(),
      onOpenChange
    });

    fireEvent.click(screen.getByRole("button", { name: "Shared trigger" }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("requests close from the same trigger when already open", () => {
    const onOpenChange = vi.fn();
    renderPanel({ onOpenChange, open: true });
    const trigger = screen.getByRole("button", { name: "Shared trigger" });

    expect(fireEvent.pointerDown(trigger)).toBe(false);
    expect(fireEvent.mouseDown(trigger)).toBe(false);
    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not toggle a non-interactive trigger", () => {
    const onOpenChange = vi.fn();
    renderPanel({ interactive: false, onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Shared trigger" }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
