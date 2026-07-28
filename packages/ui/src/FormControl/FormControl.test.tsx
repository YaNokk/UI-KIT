// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { FormControl } from "./FormControl";

afterEach(cleanup);

describe("FormControl", () => {
  it("wires explicit IDs, required, description, error and caller IDs", () => {
    render(
      <>
        <span id="external-help">External</span>
        <FormControl
          controlId="email"
          describedBy="external-help"
          description="Рабочий адрес"
          error="Проверьте адрес"
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
      "external-help email-description email-error"
    );
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
      <FormControl description="Подсказка" label="Имя">
        {(props) => <input {...props} />}
      </FormControl>
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
