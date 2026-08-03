// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimeInput } from "./TimeInput";

afterEach(cleanup);

describe("TimeInput", () => {
  it("honors minuteStep and keeps invalid text uncommitted", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeInput aria-label="Время" minuteStep={15} onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Время" });
    await user.type(input, "10:10");
    expect(onChange).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, "10:15");
    expect(onChange).toHaveBeenLastCalledWith("10:15");
  });
});
