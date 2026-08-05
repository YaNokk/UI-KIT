// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFloatingOverlay } from "./useFloatingOverlay";
import { ModalLayerContext } from "../modal/ModalRuntime";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

interface FixtureOptions {
  dismissOnEscape?: boolean;
  dismissOnOutsidePress?: boolean;
  label: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function OverlayFixture({
  dismissOnEscape = true,
  dismissOnOutsidePress = true,
  label,
  onOpenChange,
  open
}: FixtureOptions) {
  const floating = useFloatingOverlay({
    dismissOnEscape,
    dismissOnOutsidePress,
    interaction: "click",
    onOpenChange,
    open,
    placement: "bottom-start"
  });

  return (
    <>
      <button
        {...floating.getReferenceProps()}
        ref={floating.refs.setReference}
        type="button"
      >
        {label} trigger
      </button>
      {open ? (
        <div
          {...floating.getFloatingProps()}
          ref={floating.refs.setFloating}
        >
          {label} content
        </div>
      ) : null}
    </>
  );
}

function StatefulOverlay({
  dismissOnEscape = true,
  dismissOnOutsidePress = true,
  label,
  onOpenChange
}: {
  dismissOnEscape?: boolean;
  dismissOnOutsidePress?: boolean;
  label: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <OverlayFixture
      dismissOnEscape={dismissOnEscape}
      dismissOnOutsidePress={dismissOnOutsidePress}
      label={label}
      onOpenChange={(next) => {
        onOpenChange?.(next);
        setOpen(next);
      }}
      open={open}
    />
  );
}

function SemanticFixture() {
  const floating = useFloatingOverlay({
    dismissOnEscape: false,
    dismissOnOutsidePress: false,
    interaction: "click",
    onOpenChange: () => undefined,
    open: true,
    placement: "bottom-start",
    role: "listbox"
  });

  return (
    <>
      <button
        {...floating.getReferenceProps()}
        ref={floating.refs.setReference}
      >
        Reference
      </button>
      <div
        {...floating.getFloatingProps()}
        ref={floating.refs.setFloating}
      >
        <div role="option">Option</div>
      </div>
    </>
  );
}

function OutsidePressBoundaryFixture({
  onOpenChange
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const outsidePressBoundaryRef = useRef<HTMLDivElement | null>(null);
  const floating = useFloatingOverlay({
    dismissOnEscape: true,
    dismissOnOutsidePress: true,
    interaction: "click",
    onOpenChange,
    open: true,
    outsidePressBoundaryRef,
    placement: "bottom-start"
  });

  return (
    <>
      <button ref={floating.refs.setReference} type="button">
        Boundary reference
      </button>
      <div ref={floating.refs.setFloating}>
        <button type="button">Boundary floating</button>
      </div>
      <div ref={outsidePressBoundaryRef}>
        <button type="button">Boundary extension</button>
      </div>
      <button type="button">Real outside</button>
    </>
  );
}

function PortalContainerProbe() {
  const floating = useFloatingOverlay({
    dismissOnEscape: true,
    dismissOnOutsidePress: true,
    interaction: "click",
    onOpenChange: () => undefined,
    open: true,
    placement: "bottom-start"
  });
  return (
    <output data-testid="portal-container">
      {floating.portalContainer?.dataset.testid ?? "global"}
    </output>
  );
}

describe("useFloatingOverlay semantics", () => {
  it("uses the modal-owned container and keeps undefined as global fallback", () => {
    const modalContainer = document.createElement("div");
    modalContainer.dataset.testid = "modal";
    const { rerender } = render(<PortalContainerProbe />);
    expect(screen.getByTestId("portal-container")).toHaveTextContent("global");

    rerender(
      <ModalLayerContext.Provider value={{
        floatingContainer: modalContainer,
        floatingLayer: 502,
        modalId: "modal",
        surfaceLayer: 501
      }}>
        <PortalContainerProbe />
      </ModalLayerContext.Provider>
    );
    expect(screen.getByTestId("portal-container")).toHaveTextContent("modal");
  });

  it("supports a DS-owned listbox role without dialog semantics", () => {
    render(<SemanticFixture />);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("extends only outside-pointer containment with outsidePressBoundaryRef", () => {
    const onOpenChange = vi.fn();
    render(<OutsidePressBoundaryFixture onOpenChange={onOpenChange} />);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Boundary reference" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Boundary floating" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Boundary extension" }));
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Real outside" }));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not extend Escape containment with outsidePressBoundaryRef", () => {
    const onOpenChange = vi.fn();
    render(<OutsidePressBoundaryFixture onOpenChange={onOpenChange} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("useFloatingOverlay activation stack", () => {
  it("keeps logical activation order when an open overlay rerenders", () => {
    const onAOpenChange = vi.fn();
    const onBOpenChange = vi.fn();

    function Harness({ marker }: { marker: number }) {
      return (
        <>
          <StatefulOverlay
            key="A"
            label={"A " + marker}
            onOpenChange={(next) => onAOpenChange(next, marker)}
          />
          <StatefulOverlay key="B" label="B" onOpenChange={onBOpenChange} />
        </>
      );
    }

    const { rerender } = render(<Harness marker={0} />);
    rerender(<Harness marker={1} />);
    rerender(<Harness marker={2} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onBOpenChange).toHaveBeenCalledTimes(1);
    expect(onBOpenChange).toHaveBeenCalledWith(false);
    expect(onAOpenChange).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onAOpenChange).toHaveBeenCalledTimes(1);
    expect(onAOpenChange).toHaveBeenCalledWith(false, 2);
  });

  it("arbitrates outside press by logical activation order, not rerenders", () => {
    const onAOpenChange = vi.fn();
    const onBOpenChange = vi.fn();

    function Harness({ marker }: { marker: number }) {
      return (
        <>
          <StatefulOverlay
            key="A"
            label={"A " + marker}
            onOpenChange={(next) => onAOpenChange(next, marker)}
          />
          <StatefulOverlay key="B" label="B" onOpenChange={onBOpenChange} />
        </>
      );
    }

    const { rerender } = render(<Harness marker={0} />);
    rerender(<Harness marker={1} />);

    fireEvent.pointerDown(document.body);
    expect(onBOpenChange).toHaveBeenCalledTimes(1);
    expect(onBOpenChange).toHaveBeenCalledWith(false);
    expect(onAOpenChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(document.body);
    expect(onAOpenChange).toHaveBeenCalledTimes(1);
    expect(onAOpenChange).toHaveBeenCalledWith(false, 1);
  });

  it("invokes the latest onOpenChange callback after rerender", () => {
    const firstCallback = vi.fn();
    const latestCallback = vi.fn();

    function Harness({ latest }: { latest: boolean }) {
      return (
        <StatefulOverlay
          label="Overlay"
          onOpenChange={latest ? latestCallback : firstCallback}
        />
      );
    }

    const { rerender } = render(<Harness latest={false} />);
    rerender(<Harness latest />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(latestCallback).toHaveBeenCalledTimes(1);
    expect(latestCallback).toHaveBeenCalledWith(false);
    expect(firstCallback).not.toHaveBeenCalled();
  });

  it("reads dismiss configuration at event time", () => {
    const onOpenChange = vi.fn();

    function Harness({ dismissOnEscape }: { dismissOnEscape: boolean }) {
      return (
        <StatefulOverlay
          dismissOnEscape={dismissOnEscape}
          dismissOnOutsidePress={false}
          label="Overlay"
          onOpenChange={onOpenChange}
        />
      );
    }

    const { rerender } = render(<Harness dismissOnEscape={false} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();

    rerender(<Harness dismissOnEscape />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });


  it("does not reactivate when dismissOnEscape changes while open", () => {
    const onAOpenChange = vi.fn();
    const onBOpenChange = vi.fn();

    function Harness({ aEscape }: { aEscape: boolean }) {
      return (
        <>
          <StatefulOverlay
            key="A"
            dismissOnEscape={aEscape}
            label="A"
            onOpenChange={onAOpenChange}
          />
          <StatefulOverlay key="B" label="B" onOpenChange={onBOpenChange} />
        </>
      );
    }

    const { rerender } = render(<Harness aEscape={false} />);
    rerender(<Harness aEscape />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onBOpenChange).toHaveBeenCalledTimes(1);
    expect(onBOpenChange).toHaveBeenCalledWith(false);
    expect(onAOpenChange).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onAOpenChange).toHaveBeenCalledTimes(1);
    expect(onAOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not reactivate when dismissOnOutsidePress changes while open", () => {
    const onAOpenChange = vi.fn();
    const onBOpenChange = vi.fn();

    function Harness({ aOutsidePress }: { aOutsidePress: boolean }) {
      return (
        <>
          <StatefulOverlay
            key="A"
            dismissOnOutsidePress={aOutsidePress}
            label="A"
            onOpenChange={onAOpenChange}
          />
          <StatefulOverlay key="B" label="B" onOpenChange={onBOpenChange} />
        </>
      );
    }

    const { rerender } = render(<Harness aOutsidePress />);
    rerender(<Harness aOutsidePress={false} />);

    fireEvent.pointerDown(document.body);
    expect(onBOpenChange).toHaveBeenCalledTimes(1);
    expect(onBOpenChange).toHaveBeenCalledWith(false);
    expect(onAOpenChange).not.toHaveBeenCalled();

    // A keeps ignoring outside press with its latest config, proving it was
    // not reactivated above B by the dismiss prop change.
    fireEvent.pointerDown(document.body);
    expect(onAOpenChange).not.toHaveBeenCalled();
  });

  it("keeps the latest dismissOnEscape value without reordering", () => {
    const onOpenChange = vi.fn();

    function Harness({ dismissOnEscape }: { dismissOnEscape: boolean }) {
      return (
        <StatefulOverlay
          dismissOnEscape={dismissOnEscape}
          dismissOnOutsidePress={false}
          label="Overlay"
          onOpenChange={onOpenChange}
        />
      );
    }

    const { rerender } = render(<Harness dismissOnEscape={false} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();

    rerender(<Harness dismissOnEscape />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps the latest dismissOnOutsidePress value without reordering", () => {
    const onOpenChange = vi.fn();

    function Harness({ outsidePress }: { outsidePress: boolean }) {
      return (
        <StatefulOverlay
          dismissOnEscape={false}
          dismissOnOutsidePress={outsidePress}
          label="Overlay"
          onOpenChange={onOpenChange}
        />
      );
    }

    const { rerender } = render(<Harness outsidePress={false} />);
    fireEvent.pointerDown(document.body);
    expect(onOpenChange).not.toHaveBeenCalled();

    rerender(<Harness outsidePress />);
    fireEvent.pointerDown(document.body);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps activation order stable through dismiss config churn", () => {
    const onAOpenChange = vi.fn();
    const onBOpenChange = vi.fn();

    function Harness({ churn }: { churn: number }) {
      return (
        <>
          <StatefulOverlay
            key="A"
            dismissOnEscape={churn % 2 === 0}
            dismissOnOutsidePress={churn % 3 === 0}
            label="A"
            onOpenChange={(next) => onAOpenChange(next, churn)}
          />
          <StatefulOverlay key="B" label="B" onOpenChange={onBOpenChange} />
        </>
      );
    }

    const { rerender } = render(<Harness churn={0} />);
    rerender(<Harness churn={1} />);
    rerender(<Harness churn={2} />);
    rerender(<Harness churn={3} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onBOpenChange).toHaveBeenCalledTimes(1);
    expect(onBOpenChange).toHaveBeenCalledWith(false);
    expect(onAOpenChange).not.toHaveBeenCalled();
  });

  it("does not leave duplicate registrations under StrictMode replay", () => {
    const onAOpenChange = vi.fn();
    const onBOpenChange = vi.fn();

    render(
      <StrictMode>
        <StatefulOverlay label="A" onOpenChange={onAOpenChange} />
        <StatefulOverlay label="B" onOpenChange={onBOpenChange} />
      </StrictMode>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onBOpenChange).toHaveBeenCalledTimes(1);
    expect(onAOpenChange).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onAOpenChange).toHaveBeenCalledTimes(1);
  });

  it("removes an unmounted overlay registration exactly once", () => {
    const onAOpenChange = vi.fn();
    const onBOpenChange = vi.fn();

    function Harness({ showB }: { showB: boolean }) {
      return (
        <>
          <StatefulOverlay label="A" onOpenChange={onAOpenChange} />
          {showB ? (
            <StatefulOverlay label="B" onOpenChange={onBOpenChange} />
          ) : null}
        </>
      );
    }

    const { rerender } = render(<Harness showB />);
    rerender(<Harness showB={false} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onAOpenChange).toHaveBeenCalledTimes(1);
    expect(onAOpenChange).toHaveBeenCalledWith(false);
    expect(onBOpenChange).not.toHaveBeenCalled();
  });

  it("creates a new activation order after close and reopen", () => {
    const onAOpenChange = vi.fn();
    const onBOpenChange = vi.fn();

    function Harness({ aOpen }: { aOpen: boolean }) {
      return (
        <>
          <OverlayFixture
            label="A"
            onOpenChange={onAOpenChange}
            open={aOpen}
          />
          <StatefulOverlay label="B" onOpenChange={onBOpenChange} />
        </>
      );
    }

    const { rerender } = render(<Harness aOpen />);
    rerender(<Harness aOpen={false} />);
    rerender(<Harness aOpen />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onAOpenChange).toHaveBeenCalledTimes(1);
    expect(onBOpenChange).not.toHaveBeenCalled();
  });
});
