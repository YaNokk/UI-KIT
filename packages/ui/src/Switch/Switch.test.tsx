// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

afterEach(cleanup);

describe("Switch", () => {
  it("uses a native checkbox with switch semantics", async () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    const user = userEvent.setup();
    render(<Switch label="Push notifications" onChange={onChange} ref={ref} />);
    const control = screen.getByRole("switch", { name: "Push notifications" });
    await user.click(screen.getByText("Push notifications"));
    expect(ref.current).toBe(control);
    expect(control).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ type: "change" }));
  });

  it("lets error replace description and disables natively", () => {
    render(
      <Switch
        description="Can be changed later"
        disabled
        error="Unavailable"
        id="setting"
        label="Autosave"
      />
    );
    const control = screen.getByRole("switch", { name: "Autosave" });
    expect(control).toBeDisabled();
    expect(control).toHaveAttribute("aria-describedby", "setting-error");
    expect(screen.queryByText("Can be changed later")).not.toBeInTheDocument();
    expect(screen.getByText("Unavailable")).not.toHaveAttribute("role", "alert");
  });

  it("uses native checked, unchecked and default-on form submission", () => {
    const { container } = render(
      <form>
        <Switch defaultChecked label="Named value" name="named" value="enabled" />
        <Switch label="Off value" name="off" value="enabled" />
        <Switch defaultChecked label="Default value" name="default" />
      </form>
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("Expected form fixture");
    const data = new FormData(form);
    expect(data.get("named")).toBe("enabled");
    expect(data.has("off")).toBe(false);
    expect(data.get("default")).toBe("on");
  });

  it("has no detectable axe violations across message states", async () => {
    const { container } = render(
      <>
        <Switch description="Immediate effect" label="Notifications" />
        <Switch error="Required setting" label="Security" />
      </>
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
