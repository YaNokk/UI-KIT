// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

afterEach(cleanup);

describe("Checkbox", () => {
  it("uses a native input and reports checked state before the event", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox label="News" name="news" onChange={onChange} value="yes" />);

    const checkbox = screen.getByRole("checkbox", { name: "News" });
    await user.click(screen.getByText("News"));

    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ type: "change" }));
    expect(checkbox).toHaveAttribute("name", "news");
    expect(checkbox).toHaveAttribute("value", "yes");
  });

  it("sets indeterminate on the native input and forwards its ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox indeterminate label="Select all" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole("checkbox", { name: "Select all" }));
    expect(ref.current?.indeterminate).toBe(true);
  });

  it("keeps the native indeterminate property aligned with an unchanged prop", async () => {
    const user = userEvent.setup();
    render(<Checkbox indeterminate label="Select all" />);
    const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name: "Select all" });
    await user.click(checkbox);
    expect(checkbox.indeterminate).toBe(true);
  });

  it("lets error replace description and preserves external description IDs", () => {
    render(
      <Checkbox
        aria-describedby="external"
        description="Hint"
        error="Agreement is required"
        id="terms"
        label="Terms"
      />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Terms" });
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-describedby", "external terms-error");
    expect(screen.queryByText("Hint")).not.toBeInTheDocument();
    expect(screen.getByText("Agreement is required")).not.toHaveAttribute("role", "alert");
  });

  it("uses native checked, unchecked and default-on form submission", () => {
    const { container } = render(
      <form>
        <Checkbox defaultChecked label="Named value" name="named" value="yes" />
        <Checkbox label="Unchecked value" name="unchecked" value="yes" />
        <Checkbox defaultChecked label="Default value" name="default" />
      </form>
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("Expected form fixture");
    const data = new FormData(form);
    expect(data.get("named")).toBe("yes");
    expect(data.has("unchecked")).toBe(false);
    expect(data.get("default")).toBe("on");
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(<Checkbox description="Sent once a week" label="News" />);
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
