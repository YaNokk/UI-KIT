// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimeInput } from "./TimeInput";

afterEach(cleanup);

describe("TimeInput", () => {
  it("forwards its ref to the focusable input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TimeInput aria-label="Время" ref={ref} />);
    const input = screen.getByRole("textbox", { name: "Время" });

    expect(ref.current).toBe(input);
    ref.current?.focus();
    expect(input).toHaveFocus();
  });

  it("honors minuteStep and keeps invalid text uncommitted", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeInput aria-label="Время" minuteStep={15} onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Время" }) as HTMLInputElement;
    await user.type(input, "10:10");
    expect(onChange).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, "10:15");
    expect(onChange).toHaveBeenLastCalledWith("10:15");
  });

  it("filters letters and punctuation while preserving caret editing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeInput aria-label="Время" onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Время" }) as HTMLInputElement;
    await user.type(input, "a10?15");
    expect(input).toHaveValue("10:15");
    expect(onChange).toHaveBeenLastCalledWith("10:15");
    await user.keyboard("{Backspace}");
    expect(input).toHaveValue("10:1");
    input.setSelectionRange(0, input.value.length);
    await user.keyboard("2345");
    expect(input).toHaveValue("23:45");
  });
});
