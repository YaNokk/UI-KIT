import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import {
  InternationalPhoneInput,
  type PhoneCountryCode
} from "./InternationalPhoneInput";

const meta = {
  title: "Components/InternationalPhoneInput",
  component: InternationalPhoneInput,
  args: {
    countries: ["RU", "PL", "DE", "GB", "US"],
    defaultCountry: "RU",
    id: "international-phone",
    label: "Телефон"
  },
  parameters: {
    docs: {
      description: {
        component:
          "International phone editor with canonical `+` plus digits storage, "
          + "locale-aware country metadata, Maskito editing, and responsive "
          + "Popover/BottomSheet country selection."
      }
    }
  }
} satisfies Meta<typeof InternationalPhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledExample(props: ComponentProps<typeof InternationalPhoneInput>) {
  const [value, setValue] = useState(props.value ?? "");
  const [country, setCountry] = useState<PhoneCountryCode | null>(
    props.country ?? props.defaultCountry ?? null
  );
  return (
    <InternationalPhoneInput
      {...props}
      country={country}
      onCountryChange={setCountry}
      onValueChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Телефон" });
    await userEvent.type(input, "4957888878");
    await expect(input).toHaveValue("+7 495 788 88 78");
  }
};

export const Controlled: Story = {
  args: { country: "PL", value: "+48123123123" },
  render: (args) => <ControlledExample {...args} />
};

export const InnerLabel: Story = {
  args: { defaultValue: "+74957888878", labelView: "inner" }
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <InternationalPhoneInput
          {...args}
          defaultValue="+74957888878"
          id={`phone-${size}`}
          key={size}
          label={`Телефон ${size}`}
          size={size}
        />
      ))}
    </div>
  )
};

export const Disabled: Story = {
  args: { defaultValue: "+74957888878", disabled: true }
};

export const ReadOnly: Story = {
  args: { defaultValue: "+74957888878", readOnly: true }
};

export const Error: Story = {
  args: { defaultValue: "+7495", error: "Проверьте номер телефона" }
};

export const CountryAllowlist: Story = {
  args: { countries: ["RU", "PL"], defaultCountry: "PL" }
};

export const RuntimeLocales: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <DesignSystemProvider locale="ru-RU" mode="light">
        <InternationalPhoneInput {...args} id="phone-ru" label="Телефон" />
      </DesignSystemProvider>
      <DesignSystemProvider locale="en-US" mode="light">
        <InternationalPhoneInput {...args} id="phone-en" label="Phone" />
      </DesignSystemProvider>
    </div>
  )
};

export const ExplicitEnglishLocale: Story = {
  args: { label: "Phone", locale: "en-US" },
  render: (args) => <ControlledExample {...args} />
};

export const RuntimeBrands: Story = {
  render: (args) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand stress fixture.
    <DesignSystemProvider brand={{ accentColor: "#7c3aed", foregroundColor: "#ffffff" }} mode="light">
      <InternationalPhoneInput {...args} />
    </DesignSystemProvider>
  )
};

export const PasteAndDetection: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Телефон" });
    await userEvent.click(input);
    await userEvent.paste("+48 123 123 123");
    await expect(input).toHaveValue("+48 12 312 31 23");
    await expect(canvas.getByRole("button", { name: /Польша/ })).toBeVisible();
  }
};

export const CountrySwitch: Story = {
  args: { defaultValue: "+74957888878" },
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Выбрать страну/ }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("option", { name: /Польша/ }));
    await expect(canvas.getByRole("textbox", { name: "Телефон" }))
      .toHaveValue("+48 495 788 8878");
  }
};

export const ClearPolicies: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <InternationalPhoneInput {...args} defaultValue="+74957888878" label="Сохраняет код" />
      <InternationalPhoneInput
        {...args}
        defaultValue="+74957888878"
        label="Очищает полностью"
        preserveCountryCallingCode={false}
      />
    </div>
  )
};

export const Narrow320: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: (args) => <div style={{ inlineSize: "100%" }}><InternationalPhoneInput {...args} /></div>
};

export const Popover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Выбрать страну/ }));
    await expect(within(canvasElement.ownerDocument.body).getByRole("listbox")).toBeVisible();
  }
};

export const BottomSheet: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Выбрать страну/ }));
    await expect(within(canvasElement.ownerDocument.body).getByRole("listbox")).toBeVisible();
  }
};

export const LongCountryNames: Story = {
  args: { countries: ["GB", "US", "DE", "PL", "RU"] }
};

export const RTL: Story = {
  render: (args) => <div dir="rtl"><InternationalPhoneInput {...args} locale="ar" /></div>
};

export const ForcedColors: Story = {
  parameters: { pseudo: { forcedColors: "active" } }
};

export const ReducedMotion: Story = {
  parameters: { backgrounds: { default: "light" } }
};
