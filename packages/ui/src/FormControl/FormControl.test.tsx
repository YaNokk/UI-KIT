// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { FormControl } from "./FormControl";

afterEach(cleanup);

describe("FormControl", () => {
  it("lets error replace hint and wires only the visible message", () => {
    render(
      <>
        <span id="external-help">External</span>
        <FormControl
          controlId="email"
          describedBy="external-help"
          error="Проверьте адрес"
          hint="Рабочий адрес"
          label="Email"
          required
        >
          {(props) => <input {...props} />}
        </FormControl>
      </>
    );

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("id", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "external-help email-error"
    );
    expect(screen.queryByText("Рабочий адрес")).not.toBeInTheDocument();
    expect(screen.getByText("Проверьте адрес")).toBeInTheDocument();
  });

  it("generates a stable control ID when none is supplied", () => {
    const { rerender } = render(
      <FormControl label="Имя">
        {(props) => <input {...props} />}
      </FormControl>
    );
    const firstId = screen.getByLabelText("Имя").id;

    rerender(
      <FormControl label="Имя">
        {(props) => <input {...props} />}
      </FormControl>
    );

    expect(firstId).not.toBe("");
    expect(screen.getByLabelText("Имя")).toHaveAttribute("id", firstId);
  });

  it("does not infer native required from a label alone", () => {
    render(
      <FormControl label="Необязательное поле">
        {(props) => <input {...props} />}
      </FormControl>
    );

    expect(screen.getByLabelText("Необязательное поле")).not.toBeRequired();
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(
      <FormControl hint="Подсказка" label="Имя">
        {(props) => <input {...props} />}
      </FormControl>
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });

  it("passes the same semantic label into the inner field composition", () => {
    render(
      <FormControl controlId="inner" label="Внутренняя подпись" labelView="inner">
        {({ label: innerLabel, ...props }) => (
          <div>
            {innerLabel}
            <input {...props} />
          </div>
        )}
      </FormControl>
    );

    expect(screen.getByRole("textbox", { name: "Внутренняя подпись" }))
      .toHaveAttribute("id", "inner");
  });
});
