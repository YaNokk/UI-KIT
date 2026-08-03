// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalendarTriggerAddon } from "./CalendarTriggerAddon";

afterEach(cleanup);

describe("CalendarTriggerAddon", () => {
  it.each(["{Enter}", " "])("opens from the keyboard with %s", async (key) => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<CalendarTriggerAddon label="Open calendar" onOpen={onOpen} open={false} />);
    const button = screen.getByRole("button", { name: "Open calendar" });
    button.focus();
    await user.keyboard(key);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("opens once from click and preserves field focus on pointer down", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<CalendarTriggerAddon label="Open calendar" onOpen={onOpen} open={false} />);
    const button = screen.getByRole("button", { name: "Open calendar" });
    expect(fireEvent.pointerDown(button)).toBe(false);
    await user.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it.each([
    { disabled: true, open: false, readOnly: false },
    { disabled: false, open: false, readOnly: true },
    { disabled: false, open: true, readOnly: false }
  ])("does not open for $disabled/$readOnly/$open state", async (props) => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<CalendarTriggerAddon label="Open calendar" onOpen={onOpen} {...props} />);
    const button = screen.getByRole("button", { name: "Open calendar" });
    if (props.disabled || props.readOnly) expect(button).toBeDisabled();
    await user.click(button);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
