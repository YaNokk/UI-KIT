// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useFloatingOverlay } from "./useFloatingOverlay";

afterEach(cleanup);

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

describe("useFloatingOverlay semantics", () => {
  it("supports a DS-owned listbox role without dialog semantics", () => {
    render(<SemanticFixture />);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
