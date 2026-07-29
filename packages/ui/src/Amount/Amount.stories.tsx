import type { Meta, StoryObj } from "@storybook/react-vite";
import { Amount } from "./Amount";

const meta = {
  title: "Components/Amount",
  component: Amount,
  args: {
    currency: "PLN",
    locale: "pl-PL",
    minority: 100,
    value: 123456
  },
  parameters: {
    docs: {
      description: {
        component:
          "Display-only amount. `value` is a safe integer in minor units; "
          + "`minority` is the number of minor units in one major unit."
      }
    }
  }
} satisfies Meta<typeof Amount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Amount {...args} key={size} size={size} />
      ))}
    </div>
  )
};

export const Currencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <Amount currency="PLN" locale="pl-PL" value={123456} />
      <Amount currency="USD" locale="en-US" value={123456} />
      <Amount currency="JPY" locale="ja-JP" value={123456} />
      <Amount currency="KWD" locale="en-US" value={123456} />
    </div>
  )
};

export const Negative: Story = {
  args: { value: -123456 }
};

export const MinorTone: Story = {
  args: {
    emphasis: "strong",
    minorTone: "secondary"
  }
};

export const LongValues: Story = {
  args: { value: Number.MAX_SAFE_INTEGER }
};
