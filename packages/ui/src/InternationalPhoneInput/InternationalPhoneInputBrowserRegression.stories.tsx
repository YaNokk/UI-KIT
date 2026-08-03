import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { getPhoneCountries } from "../internal/phone/phone-number-adapter";
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
        country={country}
        label="Телефон"
        onCountryChange={setCountry}
        onValueChange={setValue}
        value={value}
      />
    </div>
  );
}

function AllowlistHarness() {
  return (
    <div style={{ inlineSize: "min(100%, 28rem)" }}>
      <InternationalPhoneInput
        countries={["RU", "PL"]}
        defaultCountry="RU"
        label="Телефон"
      />
    </div>
  );
}

function SelectedCountryHarness({ country }: { country: PhoneCountryCode }) {
  const [value, setValue] = useState("");
  return (
    <div style={{ inlineSize: "min(100%, 28rem)" }}>
      <InternationalPhoneInput
        country={country}
        label="Телефон"
        onValueChange={setValue}
        value={value}
      />
    </div>
  );
}

type StoryQueries = ReturnType<typeof within>;

async function openCountryPicker(canvas: StoryQueries, body: StoryQueries) {
  await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну/ }));
  const listbox = await body.findByRole("listbox");
  const search = await body.findByPlaceholderText("Поиск страны");
  return { listbox, search };
}

async function searchCountry(
  body: StoryQueries,
  query: string,
  expectedName: RegExp
) {
  const search = await body.findByPlaceholderText("Поиск страны");
  await userEvent.clear(search);
  await userEvent.type(search, query);
  return body.findByRole("option", { name: expectedName });
}

async function chooseCountry(
  body: StoryQueries,
  query: string,
  expectedName: RegExp
) {
  const option = await searchCountry(body, query, expectedName);
  await userEvent.click(option);
  return option;
}

function assetFlag(root: ParentNode, country: string) {
  const flag = root.querySelector<HTMLElement>(`[data-country-flag='${country}']`);
  const svg = flag?.querySelector<SVGSVGElement>("svg");
  if (!flag || !svg) throw new Error(`Asset flag ${country} was not rendered.`);
  return { flag, svg };
}

export const PopoverGeometryTypingPasteAndFocus: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("textbox", { name: "Телефон" }) as HTMLInputElement;
    const shell = canvasElement.querySelector<HTMLElement>("[data-field-part='shell']");
    if (!shell) throw new Error("Phone FieldShell was not rendered.");

    await userEvent.type(input, "4957888878");
    await expect(input).toHaveValue("+7 495 788 88 78");
    await userEvent.clear(input);
    await userEvent.paste("+48 123 123 123");
    await expect(input).toHaveValue("+48 12 312 31 23");
    await expect(canvas.getByRole("button", { name: /Польша/ })).toBeVisible();

    const { listbox } = await openCountryPicker(canvas, documentBody);
    const surface = listbox.closest("[data-select-surface]") as HTMLElement | null;
    if (!surface) throw new Error("Country Popover surface was not rendered.");
    await expect(Math.abs(surface.getBoundingClientRect().width - shell.getBoundingClientRect().width))
      .toBeLessThanOrEqual(1);
    await chooseCountry(documentBody, "герм", /Германия/);
    await expect(input).toHaveFocus();
    await expect(documentBody.queryByRole("listbox")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /Германия, \+49/ })).toBeVisible();
    await expect(canvasElement.querySelector("[data-country-flag='DE']"))
      .toHaveAttribute("aria-hidden", "true");
    await expect(input.value).toMatch(/^\+49(?:\s|$)/);
    await expect(input.selectionStart ?? 0).toBeGreaterThanOrEqual(3);
  }
};

export const BrowserAutofillWithoutInputEvent: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Телефон" });
    await userEvent.click(input);
    const nativeValueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;
    if (!nativeValueSetter) throw new Error("Native input value setter is unavailable.");
    nativeValueSetter.call(input, "+7 911 854-48-71");

    await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну/ }));

    await expect(input).toHaveValue("+7 911 854 48 71");
    await expect(canvas.getByRole("button", { name: /Россия/ })).toBeVisible();
  }
};

export const CompactBottomSheetParity: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await openCountryPicker(canvas, body);
    await chooseCountry(body, "поль", /Польша/);
    await expect(canvas.getByRole("button", { name: /Польша, \+48/ })).toHaveFocus();
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

export const AllCountriesVirtualized: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const { listbox } = await openCountryPicker(canvas, body);
    await expect(listbox).toHaveAttribute("data-select-virtualized");
    const mountedOptions = within(listbox).getAllByRole("option", { hidden: true });
    await expect(mountedOptions.length).toBeLessThan(getPhoneCountries().length);
  }
};

export const VirtualizedSelectedCountryStateOnOpen: Story = {
  render: () => <SelectedCountryHarness country="JP" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const { listbox } = await openCountryPicker(canvas, body);
    await expect(listbox).toHaveAttribute("data-select-virtualized");
    await expect(canvas.getByRole("button", { name: /Япония, \+81/ }))
      .toHaveAttribute("aria-expanded", "true");
  }
};

export const CountryAllowlist: Story = {
  render: () => <AllowlistHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await openCountryPicker(canvas, body);
    const listbox = await body.findByRole("listbox");
    await expect(listbox).not.toHaveAttribute("data-select-virtualized");
    const options = within(listbox).getAllByRole("option");
    await expect(options).toHaveLength(2);
    await expect(options.map((option) => option.textContent).join(" ")).toMatch(/Россия/);
    await expect(options.map((option) => option.textContent).join(" ")).toMatch(/Польша/);
  }
};

export const FixedCallingCodeBackspace: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Телефон" }) as HTMLInputElement;
    await userEvent.type(input, "495");
    await userEvent.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}");
    await expect(input.value).toMatch(/^\+7(?:\s|$)/);
  }
};

export const FixedCallingCodeDelete: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Телефон" }) as HTMLInputElement;
    await userEvent.type(input, "495");
    input.setSelectionRange(0, 2);
    await userEvent.keyboard("{Delete}");
    await expect(input.value).toMatch(/^\+7(?:\s|$)/);
  }
};

export const FixedCallingCodeSelectionReplacement: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Телефон" }) as HTMLInputElement;
    await userEvent.type(input, "495");
    input.setSelectionRange(0, 2);
    await userEvent.type(input, "+48");
    await expect(input.value).toMatch(/^\+7(?:\s|$)/);
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

export const RussianCountrySearchAllCountries: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну: Россия/ }));
    const search = body.getByPlaceholderText("Поиск страны");
    for (const query of ["япон", "JP", "+81"]) {
      await userEvent.clear(search);
      await userEvent.type(search, query);
      await expect(body.getByRole("option", { name: /Япония/ })).toBeVisible();
    }
  }
};

export const AssetFlagTrigger: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { flag, svg } = assetFlag(canvasElement, "RU");
    await expect(flag).toHaveAttribute("data-country-flag-asset");
    await expect(flag).toHaveAttribute("aria-hidden", "true");
    await expect(svg).toHaveAttribute("aria-hidden", "true");
    await expect(svg).toHaveAttribute("focusable", "false");
    await expect(flag.textContent).toBe("");
    const rect = flag.getBoundingClientRect();
    await expect(rect.width / rect.height).toBeCloseTo(1.5, 1);
  }
};

export const AssetFlagOptions: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну/ }));
    await userEvent.type(body.getByPlaceholderText("Поиск страны"), "япон");
    const option = body.getByRole("option", { name: /Япония/ });
    const { flag, svg } = assetFlag(option, "JP");
    await expect(flag).toHaveAttribute("data-size", "md");
    await expect(svg).toHaveAttribute("focusable", "false");
    const rect = flag.getBoundingClientRect();
    await expect(rect.width / rect.height).toBeCloseTo(1.5, 1);
  }
};

export const PopoverAllCountries: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну/ }));
    const search = await body.findByPlaceholderText("Поиск страны");
    await expect(search).toBeVisible();
    await userEvent.click(search);
    await userEvent.type(search, "браз");
    await expect(body.getByRole("option", { name: /Бразилия/ })).toBeVisible();
  }
};

export const BottomSheetAllCountries: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну/ }));
    await expect(await body.findByRole("dialog")).toHaveAttribute(
      "data-modal-kind",
      "bottom-sheet"
    );
    await expect(body.getByPlaceholderText("Поиск страны")).toBeVisible();
    await expect(await searchCountry(body, "австр", /Австралия/)).toBeVisible();
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
