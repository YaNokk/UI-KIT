// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import styles from "./FieldShell.module.css";
import { FieldShell } from "./FieldShell";

afterEach(cleanup);

describe("FieldShell", () => {
  it("supports every size and forwards its container ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <FieldShell ref={ref} size="lg">
        <button type="button">Trigger</button>
      </FieldShell>
    );

    expect(ref.current).toHaveClass(styles.root, styles.lg);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("represents disabled, readOnly and invalid as distinct states", () => {
    render(
      <>
        <FieldShell disabled><span>Disabled</span></FieldShell>
        <FieldShell readOnly><span>Read only</span></FieldShell>
        <FieldShell invalid><span>Invalid</span></FieldShell>
      </>
    );

    expect(screen.getByText("Disabled").parentElement?.parentElement).toHaveAttribute("data-disabled");
    expect(screen.getByText("Read only").parentElement?.parentElement).toHaveAttribute("data-readonly");
    expect(screen.getByText("Invalid").parentElement?.parentElement).toHaveAttribute("data-invalid");
  });

  it("keeps generic adornment semantics intact", () => {
    render(
      <FieldShell
        endAdornment={<button type="button">Choose</button>}
        startAdornment={<span>₽</span>}
      >
        <input aria-label="Сумма" />
      </FieldShell>
    );

    expect(screen.getByText("₽")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Сумма" })).toBeInTheDocument();
  });
});
