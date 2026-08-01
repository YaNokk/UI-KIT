// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Radio } from "./Radio";

afterEach(cleanup);

describe("Radio", () => {
  it("keeps native radio semantics and forwards the input ref", async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Radio label="Daily" name="frequency" onChange={onChange} ref={ref} value="daily" />);
    const radio = screen.getByRole("radio", { name: "Daily" });
    await user.click(radio);
    expect(ref.current).toBe(radio);
    expect(radio).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ type: "change" }));
  });

  it("uses native disabled behavior", () => {
    render(<Radio disabled label="Unavailable" />);
    expect(screen.getByRole("radio", { name: "Unavailable" })).toBeDisabled();
  });

  it("associates its description and preserves consumer aria-describedby", () => {
    render(
      <>
        <span id="external-description">External context</span>
        <Radio
          aria-describedby="external-description"
          description="Sent once a week"
          id="radio-news"
          label="News"
        />
      </>
    );

    const radio = screen.getByRole("radio", { name: "News" });
    expect(radio).toHaveAttribute(
      "aria-describedby",
      "external-description radio-news-description"
    );
    expect(document.getElementById("radio-news-description")).toHaveTextContent(
      "Sent once a week"
    );
  });

  it("submits one value for a native radio composition", () => {
    const { container } = render(
      <form>
        <Radio label="Daily" name="frequency" value="daily" />
        <Radio defaultChecked label="Weekly" name="frequency" value="weekly" />
      </form>
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("Expected form fixture");
    expect(new FormData(form).getAll("frequency")).toEqual(["weekly"]);
  });

  it("has no detectable axe violations with a description", async () => {
    const { container } = render(
      <Radio description="Sent once a week" label="News" name="news" value="weekly" />
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
