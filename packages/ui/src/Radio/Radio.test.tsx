// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Radio } from "./Radio";

afterEach(cleanup);

describe("Radio", () => {
  it("keeps native radio semantics and forwards the input ref", async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Radio label="Ежедневно" name="frequency" onChange={onChange} ref={ref} value="daily" />);
    const radio = screen.getByRole("radio", { name: "Ежедневно" });
    await user.click(radio);
    expect(ref.current).toBe(radio);
    expect(radio).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ type: "change" }));
  });

  it("uses native disabled behavior", () => {
    render(<Radio disabled label="Недоступно" />);
    expect(screen.getByRole("radio", { name: "Недоступно" })).toBeDisabled();
  });
});
