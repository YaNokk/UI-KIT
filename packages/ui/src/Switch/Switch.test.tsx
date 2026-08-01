// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

afterEach(cleanup);

describe("Switch", () => {
  it("uses a native checkbox with switch semantics", async () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    const user = userEvent.setup();
    render(<Switch label="Push-уведомления" onChange={onChange} ref={ref} />);
    const control = screen.getByRole("switch", { name: "Push-уведомления" });
    await user.click(screen.getByText("Push-уведомления"));
    expect(ref.current).toBe(control);
    expect(control).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ type: "change" }));
  });

  it("lets error replace description and disables natively", () => {
    render(
      <Switch
        description="Можно изменить позже"
        disabled
        error="Недоступно"
        id="setting"
        label="Автосохранение"
      />
    );
    const control = screen.getByRole("switch", { name: "Автосохранение" });
    expect(control).toBeDisabled();
    expect(control).toHaveAttribute("aria-describedby", "setting-error");
    expect(screen.queryByText("Можно изменить позже")).not.toBeInTheDocument();
  });
});
