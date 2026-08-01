// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { Badge } from "./Badge";

afterEach(cleanup);

describe("Badge", () => {
  it("keeps zero visible", () => {
    const { container } = render(<Badge>{0}</Badge>);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(container.querySelector("[data-counter-text]")).toHaveTextContent("0");
    expect(container.querySelector("[data-counter-text]"))
      .toHaveAttribute("data-control-text-role", "counterText");
    expect(container.querySelector("[data-control-text-clip]")).toContainElement(
      container.querySelector("[data-counter-text]")
    );
  });

  it("formats numeric overflow only when max is provided", () => {
    const { rerender } = render(<Badge>{120}</Badge>);
    expect(screen.getByText("120")).toBeInTheDocument();

    rerender(<Badge max={99}>{120}</Badge>);
    expect(screen.getByText("99+")).toBeInTheDocument();

    rerender(<Badge max={1}>!</Badge>);
    expect(screen.getByText("!")).toBeInTheDocument();
  });

  it("ignores an invalid max and warns in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Badge max={-1}>{12}</Badge>);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("supports an accessible label override", () => {
    render(<Badge label="3 непрочитанных уведомления">3</Badge>);
    expect(screen.getByLabelText("3 непрочитанных уведомления"))
      .toHaveTextContent("3");
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(<div><Badge>{0}</Badge><Badge color="red" max={99}>{120}</Badge></div>);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
