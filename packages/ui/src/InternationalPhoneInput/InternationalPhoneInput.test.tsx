// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { InternationalPhoneInput } from "./InternationalPhoneInput";

afterEach(cleanup);

describe("InternationalPhoneInput", () => {
  it("emits canonical value with formatting and validation metadata", () => {
    const onValueChange = vi.fn();
    render(
      <InternationalPhoneInput
        countries={["RU", "PL"]}
        defaultCountry="RU"
        label="Телефон"
        onValueChange={onValueChange}
      />
    );

    const input = screen.getByRole("textbox", { name: "Телефон" });
    fireEvent.change(input, { target: { value: "+7 (495) 788-88-78" } });

    expect(onValueChange).toHaveBeenLastCalledWith(
      "+74957888878",
      expect.objectContaining({
        callingCode: "7",
        country: "RU",
        formattedValue: "+7 495 788 88 78",
        isPossible: true,
        isValid: true,
        source: "input"
      })
    );
  });

  it("normalizes pasted national values under the selected country", () => {
    const onValueChange = vi.fn();
    render(
      <InternationalPhoneInput
        countries={["RU"]}
        defaultCountry="RU"
        onValueChange={onValueChange}
        aria-label="Телефон"
      />
    );
    const input = screen.getByRole("textbox", { name: "Телефон" });
    fireEvent.paste(input, {
      clipboardData: { getData: () => "8 (495) 788-88-78" }
    });
    expect(onValueChange).toHaveBeenLastCalledWith(
      "+74957888878",
      expect.objectContaining({ source: "paste" })
    );
  });

  it("seeds the country prefix only while an empty field is being edited", () => {
    render(
      <InternationalPhoneInput
        countries={["RU"]}
        defaultCountry="RU"
        aria-label="Phone"
      />
    );
    const input = screen.getByRole("textbox", { name: "Phone" });
    expect(input).toHaveValue("");
    fireEvent.focus(input);
    expect(input).toHaveValue("+7");
    fireEvent.blur(input);
    expect(input).toHaveValue("");
  });

  it("preserves national digits, closes the picker, and focuses input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <InternationalPhoneInput
        countries={["RU", "PL"]}
        defaultCountry="RU"
        defaultValue="+74957888878"
        locale="en-US"
        onValueChange={onValueChange}
        aria-label="Phone"
      />
    );
    await user.click(screen.getByRole("button", { name: /Choose country: Russia/ }));
    await user.click(await screen.findByRole("option", { name: /Poland/ }));

    expect(onValueChange).toHaveBeenLastCalledWith(
      "+484957888878",
      expect.objectContaining({ country: "PL", source: "country" })
    );
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Phone" })).toHaveFocus());
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not override controlled country from number detection", () => {
    const onCountryChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <InternationalPhoneInput
        countries={["RU", "PL"]}
        country="RU"
        onCountryChange={onCountryChange}
        onValueChange={onValueChange}
        aria-label="Phone"
      />
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Phone" }), {
      target: { value: "+48 123 123 123" }
    });
    expect(onCountryChange).not.toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith(
      "+48123123123",
      expect.objectContaining({ country: "RU" })
    );
  });

  it("supports both clear policies and retains country selection", async () => {
    const user = userEvent.setup();
    const preserve = vi.fn();
    const { rerender } = render(
      <InternationalPhoneInput
        countries={["PL"]}
        defaultCountry="PL"
        defaultValue="+48123123123"
        onValueChange={preserve}
        aria-label="Phone"
      />
    );
    await user.click(screen.getByRole("button", { name: "Clear phone number" }));
    expect(preserve).toHaveBeenLastCalledWith(
      "+48",
      expect.objectContaining({ country: "PL", source: "clear" })
    );

    const clear = vi.fn();
    rerender(
      <InternationalPhoneInput
        countries={["PL"]}
        defaultCountry="PL"
        defaultValue="+48123123123"
        onValueChange={clear}
        preserveCountryCallingCode={false}
        aria-label="Phone"
      />
    );
    await user.click(screen.getByRole("button", { name: "Clear phone number" }));
    expect(clear).toHaveBeenLastCalledWith(
      "",
      expect.objectContaining({ country: "PL", source: "clear" })
    );
  });

  it("blocks picker and clear actions for disabled and readOnly states", () => {
    const { rerender } = render(
      <InternationalPhoneInput
        countries={["RU", "PL"]}
        defaultValue="+74957888878"
        disabled
        aria-label="Phone"
      />
    );
    expect(screen.getByRole("textbox", { name: "Phone" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Choose country/ })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Clear phone number" })).toBeNull();

    rerender(
      <InternationalPhoneInput
        countries={["RU", "PL"]}
        defaultValue="+74957888878"
        readOnly
        aria-label="Phone"
      />
    );
    expect(screen.getByRole("textbox", { name: "Phone" })).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: /Choose country/ })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Clear phone number" })).toBeNull();
  });

  it("uses Provider locale, shared field geometry, and decorative flags", () => {
    const { container } = render(
      <DesignSystemProvider locale="ru-RU" mode="light">
        <InternationalPhoneInput
          countries={["RU", "PL"]}
          defaultCountry="RU"
          label="Телефон"
          labelView="inner"
          size="lg"
        />
      </DesignSystemProvider>
    );
    expect(screen.getByRole("button", { name: /Выбрать страну: Россия/ })).toBeInTheDocument();
    expect(container.querySelector("[data-field-part='shell']"))
      .toHaveAttribute("data-label-view", "inner");
    expect(container.querySelector("[data-country-flag='RU']"))
      .toHaveAttribute("aria-hidden", "true");
  });

  it("has no obvious accessibility violations", async () => {
    const { container } = render(
      <InternationalPhoneInput
        countries={["RU", "PL"]}
        defaultCountry="RU"
        hint="Use an international number"
        label="Phone"
      />
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
