// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
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

afterEach(cleanup);

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
