// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
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

    expect(screen.getByText("Disabled").closest("[data-disabled]")).toHaveAttribute("data-disabled");
    expect(screen.getByText("Read only").closest("[data-readonly]")).toHaveAttribute("data-readonly");
    expect(screen.getByText("Invalid").closest("[data-invalid]")).toHaveAttribute("data-invalid");
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

  it("delegates non-interactive shell and adornment clicks", async () => {
    const user = userEvent.setup();
    const onFocusRequest = vi.fn();
    render(
      <FieldShell
        data-testid="shell"
        endAdornment={<span>kg</span>}
        onFocusRequest={onFocusRequest}
        startAdornment={<span>₽</span>}
      >
        <input aria-label="Сумма" />
      </FieldShell>
    );

    await user.click(screen.getByTestId("shell"));
    await user.click(screen.getByText("₽"));
    await user.click(screen.getByText("kg"));
    expect(onFocusRequest).toHaveBeenCalledTimes(3);
  });

  it("does not swallow explicitly interactive adornments", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onFocusRequest = vi.fn();
    render(
      <FieldShell
        endAdornment={
          <span data-field-interactive>
            <button onClick={onAction} type="button">Выбрать</button>
          </span>
        }
        onFocusRequest={onFocusRequest}
      >
        <input aria-label="Поле" />
      </FieldShell>
    );

    const action = screen.getByRole("button", { name: "Выбрать" });
    await user.click(action);
    expect(onAction).toHaveBeenCalledOnce();
    expect(onFocusRequest).not.toHaveBeenCalled();
    expect(action).toHaveFocus();
  });

  it("uses generic inner-label presentation state", () => {
    const { rerender } = render(
      <FieldShell
        label={<label htmlFor="trigger">Магазин</label>}
        labelView="inner"
      >
        <button id="trigger" type="button">Выбрать</button>
      </FieldShell>
    );
    const shell = screen.getByRole("button").closest("[data-label-view]");
    expect(shell).toHaveAttribute("data-label-view", "inner");
    expect(shell).not.toHaveAttribute("data-label-floated");

    rerender(
      <FieldShell
        label={<label htmlFor="trigger">Магазин</label>}
        labelFloated
        labelView="inner"
      >
        <button id="trigger" type="button">Выбрать</button>
      </FieldShell>
    );
    expect(shell).toHaveAttribute("data-label-floated");
  });
});
