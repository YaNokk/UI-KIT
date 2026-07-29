import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AmountInput } from "./AmountInput";

const meta = {
  title: "Components/AmountInput",
  component: AmountInput,
  args: {
    currency: "PLN",
    id: "amount-input",
    label: "Сумма",
    locale: "pl-PL"
  },
  parameters: {
    docs: {
      description: {
        component:
          "Editable monetary field backed by Maskito. The public value is a "
          + "safe integer in minor units; the formatted DOM string is reported "
          + "only as `meta.inputValue`."
      }
    }
  }
} satisfies Meta<typeof AmountInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledExample(props: React.ComponentProps<typeof AmountInput>) {
  const [value, setValue] = useState<number | null>(null);
  return <AmountInput {...props} onChange={setValue} value={value} />;
}

export const Default: Story = {
  render: (args) => <ControlledExample {...args} />
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <AmountInput {...args} id={`amount-${size}`} key={size} size={size} />
      ))}
    </div>
  )
};

export const InnerLabel: Story = {
  args: { labelView: "inner", value: 123456 }
};

export const Currencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <AmountInput currency="PLN" label="PLN" locale="pl-PL" value={123456} />
      <AmountInput currency="USD" label="USD" locale="en-US" value={123456} />
      <AmountInput currency="JPY" label="JPY" locale="ja-JP" value={123456} />
      <AmountInput currency="KWD" label="KWD" locale="en-US" value={123456} />
    </div>
  )
};

export const Negative: Story = {
  args: { allowNegative: true, value: -123456 }
};

export const EmptyZero: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <AmountInput label="Empty means null" value={null} />
      <AmountInput label="Zero remains zero" value={0} />
    </div>
  )
};

export const ReadOnlyDisabled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <AmountInput label="Read only" readOnly value={123456} />
      <AmountInput disabled label="Disabled" value={123456} />
    </div>
  )
};

export const LongValues: Story = {
  args: { value: Number.MAX_SAFE_INTEGER }
};

export const Narrow: Story = {
  args: { labelView: "inner", value: 123456 },
  decorators: [
    (Story) => <div style={{ maxWidth: "16rem" }}><Story /></div>
  ]
};

export const EditingInteraction: Story = {
  args: {
    allowNegative: true,
    currency: "EUR",
    locale: "de-DE"
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole<HTMLInputElement>("textbox", { name: "Сумма" });
    await userEvent.type(input, "1234,56");
    await expect(input).toHaveValue("1.234,56");
    input.setSelectionRange(0, input.value.length);
    await userEvent.keyboard("-5,2");
    await expect(input).toHaveValue("-5,2");
    await userEvent.type(input, "{backspace}");
    await expect(input).toHaveValue("-5,");
    await userEvent.tab();
  }
};
