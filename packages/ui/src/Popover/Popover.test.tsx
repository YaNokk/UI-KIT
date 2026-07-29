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
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { Popover } from "./Popover";

function ControlledPopover() {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      onOpenChange={setOpen}
      open={open}
      trigger={<Button variant="secondary">Открыть Popover</Button>}
    >
      Интерактивный контент
    </Popover>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Popover", () => {
  it("opens as a non-modal floating dialog and dismisses outside", async () => {
    const user = userEvent.setup();
    render(<ControlledPopover />);

    await user.click(screen.getByRole("button", { name: "Открыть Popover" }));
    const popover = await screen.findByRole("dialog");
    expect(popover).not.toHaveAttribute("aria-modal");

    await user.click(document.body);
    await waitFor(() => {
      expect(screen.queryByText("Интерактивный контент"))
        .not.toBeInTheDocument();
    });
  });

  it("consumes the first Escape inside Dialog", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [dialogOpen, setDialogOpen] = useState(true);
      const [popoverOpen, setPopoverOpen] = useState(false);
      return (
        <Dialog
          closeLabel="Закрыть Dialog"
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          title="Parent Dialog"
        >
          <Popover
            onOpenChange={setPopoverOpen}
            open={popoverOpen}
            trigger={<Button variant="secondary">Открыть child</Button>}
          >
            Child Popover
          </Popover>
        </Dialog>
      );
    }

    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Открыть child" }));
    expect(await screen.findByText("Child Popover")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByText("Child Popover")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("dialog", { name: "Parent Dialog" }))
      .toBeInTheDocument();
  });

  it("dismisses and continues to a control in the same modal surface", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [dialogOpen, setDialogOpen] = useState(true);
      const [popoverOpen, setPopoverOpen] = useState(true);
      const [saved, setSaved] = useState(0);
      return (
        <Dialog
          closeLabel="Close Dialog"
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          title="Parent Dialog"
        >
          <Popover
            onOpenChange={setPopoverOpen}
            open={popoverOpen}
            trigger={<button>Toggle Popover</button>}
          >
            Open Popover
          </Popover>
          <button onClick={() => setSaved((value) => value + 1)}>Save</button>
          <output aria-label="Save count">{saved}</output>
        </Dialog>
      );
    }

    render(<Harness />);
    expect(await screen.findByText("Open Popover")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.queryByText("Open Popover")).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Save count" }))
      .toHaveTextContent("1");
    expect(screen.getByRole("dialog", { name: "Parent Dialog" }))
      .toBeInTheDocument();
  });

  it("closes Popover before the parent modal backdrop", async () => {
    function Harness() {
      const [dialogOpen, setDialogOpen] = useState(true);
      const [popoverOpen, setPopoverOpen] = useState(true);
      return (
        <Dialog
          closeLabel="Close Dialog"
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          title="Backdrop parent"
        >
          <Popover
            onOpenChange={setPopoverOpen}
            open={popoverOpen}
            trigger={<button>Toggle Popover</button>}
          >
            Backdrop child
          </Popover>
        </Dialog>
      );
    }

    const { container } = render(<Harness />);
    expect(await screen.findByText("Backdrop child")).toBeInTheDocument();
    const guard = container.ownerDocument.querySelector("[data-modal-guard]");
    expect(guard).toBeInstanceOf(HTMLElement);

    fireEvent.pointerDown(guard as HTMLElement, {
      isPrimary: true,
      pointerId: 1
    });
    fireEvent.pointerUp(guard as HTMLElement, {
      isPrimary: true,
      pointerId: 1
    });

    await waitFor(() => {
      expect(screen.queryByText("Backdrop child")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("dialog", { name: "Backdrop parent" }))
      .toBeInTheDocument();
  });

  it("toggles from its trigger exactly once", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <Popover
          onOpenChange={(nextOpen) => {
            onOpenChange(nextOpen);
            setOpen(nextOpen);
          }}
          open={open}
          trigger={<button>Toggle once</button>}
        >
          Toggle content
        </Popover>
      );
    }

    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Toggle once" }));

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("matches the trigger inline size exactly when requested", async () => {
    const nativeRect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getBoundingClientRect(this: HTMLElement) {
        if (this.textContent === "Width trigger") {
          return {
            bottom: 32,
            height: 32,
            left: 0,
            right: 240,
            top: 0,
            width: 240,
            x: 0,
            y: 0,
            toJSON: () => ({})
          };
        }
        return nativeRect.call(this);
      });

    render(
      <Popover
        matchTriggerWidth
        onOpenChange={() => undefined}
        open
        trigger={<button>Width trigger</button>}
      >
        Width content can be longer than its trigger
      </Popover>
    );

    await waitFor(() => {
      expect(document.querySelector<HTMLElement>("[data-popover-surface]"))
        .toHaveStyle({ inlineSize: "240px" });
    });
  });

  it("arbitrates nested floating dismissal from the latest activation", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [parentOpen, setParentOpen] = useState(false);
      const [childOpen, setChildOpen] = useState(false);
      return (
        <Popover
          onOpenChange={setParentOpen}
          open={parentOpen}
          trigger={<button>Open parent</button>}
        >
          <span>Parent surface</span>
          <Popover
            onOpenChange={setChildOpen}
            open={childOpen}
            trigger={<button>Open child</button>}
          >
            Child surface
          </Popover>
        </Popover>
      );
    }

    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open parent" }));
    await user.click(screen.getByRole("button", { name: "Open child" }));

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Child surface")).not.toBeInTheDocument();
    expect(screen.getByText("Parent surface")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open child" }));
    await user.click(screen.getByText("Parent surface"));
    expect(screen.queryByText("Child surface")).not.toBeInTheDocument();
    expect(screen.getByText("Parent surface")).toBeInTheDocument();
  });

  it("clamps modal floating depth and warns for one unsupported level", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    function FloatingChain({ depth }: { depth: number }) {
      return (
        <Popover
          onOpenChange={() => undefined}
          open
          trigger={<button>{`Level ${depth}`}</button>}
        >
          <span>{`Surface ${depth}`}</span>
          {depth < 5 ? <FloatingChain depth={depth + 1} /> : null}
        </Popover>
      );
    }

    render(
      <Dialog
        closeLabel="Close depth Dialog"
        onOpenChange={() => undefined}
        open
        title="Depth Dialog"
      >
        <FloatingChain depth={0} />
      </Dialog>
    );

    await waitFor(() => {
      expect(document.querySelectorAll("[data-popover-surface]")).toHaveLength(6);
    });
    const layers = [...document.querySelectorAll<HTMLElement>(
      "[data-popover-surface]"
    )].map((surface) => Number(surface.style.zIndex));

    expect(layers).toEqual([502, 503, 504, 505, 506, 506]);
    expect(Math.max(...layers)).toBeLessThan(508);
    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("exceeded the modal reserved layer range")
    );
  });

  it("does not render Portal DOM during SSR", () => {
    expect(() => renderToString(
      <Popover
        onOpenChange={() => undefined}
        open
        trigger={<button>Trigger</button>}
      >
        Content
      </Popover>
    )).not.toThrow();
  });
});
