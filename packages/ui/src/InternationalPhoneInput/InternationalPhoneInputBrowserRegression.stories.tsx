import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  InternationalPhoneInput,
  type PhoneCountryCode
} from "./InternationalPhoneInput";

const meta = {
  title: "Internal/InternationalPhoneInputBrowserRegression",
  component: InternationalPhoneInput,
  tags: ["test"]
} satisfies Meta<typeof InternationalPhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness() {
  const [value, setValue] = useState("");
  const [country, setCountry] = useState<PhoneCountryCode | null>("RU");
  return (
    <div style={{ inlineSize: "min(100%, 28rem)" }}>
      <InternationalPhoneInput
        countries={["RU", "PL", "DE", "GB", "US"]}
        country={country}
        label="Телефон"
        onCountryChange={setCountry}
        onValueChange={setValue}
        value={value}
      />
    </div>
  );
}

export const PopoverGeometryTypingPasteAndFocus: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("textbox", { name: "Телефон" });
    const shell = canvasElement.querySelector<HTMLElement>("[data-field-part='shell']");
    if (!shell) throw new Error("Phone FieldShell was not rendered.");

    await userEvent.type(input, "4957888878");
    await expect(input).toHaveValue("+7 495 788 88 78");
    await userEvent.clear(input);
    await userEvent.paste("+48 123 123 123");
    await expect(input).toHaveValue("+48 12 312 31 23");
    await expect(canvas.getByRole("button", { name: /Польша/ })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну/ }));
    const listbox = await documentBody.findByRole("listbox");
    const surface = listbox.closest<HTMLElement>("[data-select-surface]");
    if (!surface) throw new Error("Country Popover surface was not rendered.");
    await expect(Math.abs(surface.getBoundingClientRect().width - shell.getBoundingClientRect().width))
      .toBeLessThanOrEqual(1);
    await userEvent.click(documentBody.getByRole("option", { name: /Германия/ }));
    await expect(input).toHaveFocus();
    await expect(documentBody.queryByRole("listbox")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector("[data-country-flag='DE']"))
      .toHaveAttribute("aria-hidden", "true");
  }
};

export const CompactBottomSheetParity: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну/ }));
    await expect(await body.findByRole("listbox")).toBeVisible();
    await userEvent.click(body.getByRole("option", { name: /Польша/ }));
    await expect(canvas.getByRole("textbox", { name: "Телефон" })).toHaveFocus();
  }
};

export const RepeatedCountryTriggerToggle: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: /Выбрать страну/ });
    await userEvent.click(trigger);
    await expect(await body.findByRole("listbox")).toBeVisible();
    await userEvent.click(trigger);
    await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await expect(await body.findByRole("listbox")).toBeVisible();
  }
};

export const FixedCallingCodeBackspace: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Телефон" }) as HTMLInputElement;
    await userEvent.type(input, "495");
    await userEvent.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}");
    await expect(input).toHaveValue(expect.stringMatching(/^\+7(?:\s|$)/));
  }
};

export const FixedCallingCodeDelete: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Телефон" }) as HTMLInputElement;
    await userEvent.type(input, "495");
    input.setSelectionRange(0, 2);
    await userEvent.keyboard("{Delete}");
    await expect(input).toHaveValue(expect.stringMatching(/^\+7(?:\s|$)/));
  }
};

export const FixedCallingCodeSelectionReplacement: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Телефон" }) as HTMLInputElement;
    await userEvent.type(input, "495");
    input.setSelectionRange(0, 2);
    await userEvent.type(input, "+48");
    await expect(input).toHaveValue(expect.stringMatching(/^\+7(?:\s|$)/));
  }
};

export const FixedCallingCodeCaretBoundary: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Телефон" }) as HTMLInputElement;
    await userEvent.type(input, "495");
    input.setSelectionRange(0, 0);
    await userEvent.keyboard("{ArrowLeft}");
    await expect(input.selectionStart ?? 0).toBeGreaterThanOrEqual(3);
  }
};

export const InternationalPasteChangesFlag: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Телефон" });
    await userEvent.click(input);
    await userEvent.paste("+48 123 123 123");
    await expect(canvasElement.querySelector("[data-country-flag='PL']")).toBeVisible();
    await expect(input).toHaveValue("+48 12 312 31 23");
  }
};

export const NationalPasteKeepsFlag: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Телефон" });
    await userEvent.click(input);
    await userEvent.paste("8 (495) 788-88-78");
    await expect(canvasElement.querySelector("[data-country-flag='RU']")).toBeVisible();
    await expect(input).toHaveValue("+7 495 788 88 78");
  }
};

export const ClearToProtectedPrefix: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Телефон" }) as HTMLInputElement;
    await userEvent.type(input, "495");
    await userEvent.click(canvas.getByRole("button", { name: "Очистить номер телефона" }));
    await expect(input).toHaveValue("+7");
    await expect(input).toHaveFocus();
    await expect(input.selectionStart).toBe(2);
  }
};

export const RussianCountrySearch: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну: Россия/ }));
    const search = body.getByPlaceholderText("Поиск страны");
    for (const query of ["поль", "PL", "+48"]) {
      await userEvent.clear(search);
      await userEvent.type(search, query);
      await expect(body.getByRole("option", { name: /Польша/ })).toBeVisible();
    }
  }
};

export const ExplicitEnglishLocale: Story = {
  render: () => (
    <InternationalPhoneInput
      countries={["RU", "PL"]}
      defaultCountry="RU"
      label="Phone"
      locale="en-US"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Choose country: Russia/ }));
    await expect(body.getByPlaceholderText("Search countries")).toBeVisible();
    await expect(body.getByRole("option", { name: /Poland/ })).toBeVisible();
  }
};
