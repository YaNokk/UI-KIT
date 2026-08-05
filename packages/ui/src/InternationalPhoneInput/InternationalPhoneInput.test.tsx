// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { InternationalPhoneInput } from "./InternationalPhoneInput";

afterEach(cleanup);

describe("InternationalPhoneInput", () => {
  it("consumes the block layout prop instead of forwarding it to the input", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<InternationalPhoneInput block label="Phone" locale="en" />);

    expect(screen.getByRole("textbox", { name: "Phone" }))
      .not.toHaveAttribute("block");
    expect(error).not.toHaveBeenCalledWith(
      expect.stringContaining("non-boolean attribute"),
      expect.anything()
    );
  });

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

  it("forwards native browser autofill identifiers", () => {
    render(
      <form autoComplete="on">
        <InternationalPhoneInput
          autoComplete="tel"
          id="contact-phone"
          label="Телефон"
          name="phone"
        />
      </form>
    );

    const input = screen.getByRole("textbox", { name: "Телефон" });
    expect(input).toHaveAttribute("autocomplete", "tel");
    expect(input).toHaveAttribute("id", "contact-phone");
    expect(input).toHaveAttribute("name", "phone");
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toHaveAttribute("inputmode", "tel");
    expect(input).toHaveProperty("form", input.closest("form"));
  });

  it("commits a browser autofill DOM replacement on blur", async () => {
    const onValueChange = vi.fn();
    render(
      <InternationalPhoneInput
        defaultCountry="RU"
        label="Телефон"
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByRole("textbox", { name: "Телефон" });
    fireEvent.focus(input);
    const nativeValueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;
    if (!nativeValueSetter) throw new Error("Native input value setter is unavailable.");
    nativeValueSetter.call(input, "+7 911 854-48-71");

    fireEvent.blur(input);

    expect(onValueChange).toHaveBeenLastCalledWith(
      "+79118544871",
      expect.objectContaining({ country: "RU", source: "input" })
    );
    await waitFor(() => expect(input).toHaveValue("+7 911 854 48 71"));
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
      "+748123123123",
      expect.objectContaining({ country: "RU" })
    );
  });

  it("round-trips a detected international paste through controlled country", async () => {
    const onCountryChange = vi.fn();
    const onValueChange = vi.fn();

    function ControlledFixture() {
      const [country, setCountry] = useState("RU");
      const [value, setValue] = useState("");
      return (
        <InternationalPhoneInput
          aria-label="Телефон"
          countries={["RU", "PL"]}
          country={country}
          onCountryChange={(nextCountry, meta) => {
            onCountryChange(nextCountry, meta);
            setCountry(nextCountry ?? "RU");
          }}
          onValueChange={(nextValue, meta) => {
            onValueChange(nextValue, meta);
            setValue(nextValue);
          }}
          value={value}
        />
      );
    }

    render(<ControlledFixture />);
    fireEvent.paste(screen.getByRole("textbox", { name: "Телефон" }), {
      clipboardData: { getData: () => "+48 123 123 123" }
    });

    expect(onCountryChange).toHaveBeenLastCalledWith("PL", {
      previousCountry: "RU",
      source: "number"
    });
    expect(onValueChange).toHaveBeenLastCalledWith(
      "+48123123123",
      expect.objectContaining({ country: "PL", source: "paste" })
    );
    await waitFor(() => expect(screen.getByRole("button", { name: /Польша/ })).toBeVisible());
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
    await user.click(screen.getByRole("button", { name: "Очистить номер телефона" }));
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
    await user.click(screen.getByRole("button", { name: "Очистить номер телефона" }));
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
    expect(screen.getByRole("button", { name: /Выбрать страну/ })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Очистить номер телефона" })).toBeNull();

    rerender(
      <InternationalPhoneInput
        countries={["RU", "PL"]}
        defaultValue="+74957888878"
        readOnly
        aria-label="Phone"
      />
    );
    expect(screen.getByRole("textbox", { name: "Phone" })).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: /Выбрать страну/ })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Очистить номер телефона" })).toBeNull();
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

  it("uses Russian labels and country names when locale is omitted", async () => {
    const user = userEvent.setup();
    render(
      <InternationalPhoneInput
        aria-label="Телефон"
        countries={["RU", "PL", "US"]}
        defaultCountry="RU"
      />
    );
    await user.click(screen.getByRole("button", { name: /Выбрать страну: Россия/ }));
    expect(screen.getByPlaceholderText("Поиск страны")).toBeVisible();
    expect(screen.getByRole("option", { name: /Польша/ })).toBeVisible();
    expect(screen.getByRole("option", { name: /США/ })).toBeVisible();
  });

  it("supports an explicit English locale override", async () => {
    const user = userEvent.setup();
    render(
      <InternationalPhoneInput
        aria-label="Phone"
        countries={["RU", "PL"]}
        defaultCountry="RU"
        locale="en-US"
      />
    );
    await user.click(screen.getByRole("button", { name: /Choose country: Russia/ }));
    expect(screen.getByPlaceholderText("Search countries")).toBeVisible();
    expect(screen.getByRole("option", { name: /Poland/ })).toBeVisible();
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
