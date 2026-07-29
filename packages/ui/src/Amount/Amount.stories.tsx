import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Amount } from "./Amount";

const meta = {
  title: "Components/Amount",
  component: Amount,
  args: {
    currency: "PLN",
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

export const RegionalCurrencyExamples: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Representative Intl behavior coverage, not a product support registry. "
          + "The repository contains no backend currency allow-list."
      }
    }
  },
  render: () => (
    <div className="grid gap-3">
      <Amount currency="RUB" locale="ru-RU" value={123456} />
      <Amount currency="KZT" locale="kk-KZ" value={123456} />
      <Amount currency="BYN" locale="be-BY" value={123456} />
      <Amount currency="AMD" locale="hy-AM" value={123456} />
      <Amount currency="UZS" locale="uz-UZ" value={123456} />
    </div>
  )
};

export const LocaleMatrix: Story = {
  render: () => (
    <div className="grid gap-3">
      <Amount currency="KZT" locale="ru-RU" value={123456} />
      <Amount currency="KZT" locale="kk-KZ" value={123456} />
      <Amount currency="KZT" locale="en-US" value={123456} />
    </div>
  )
};

export const Negative: Story = {
  args: { value: -123456 }
};

export const MinorTone: Story = {
  args: {
    minorTone: "secondary"
  }
};

export const LargeTotals: Story = {
  args: { value: Number.MAX_SAFE_INTEGER }
};

export const TypographyComposition: Story = {
  render: (args) => (
    <div className="grid gap-3">
      <Amount {...args} className="typo-body-sm" />
      <Amount {...args} className="typo-heading-md" />
      <Amount {...args} className="typo-page-title" size="sm" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const roots = Array.from(
      canvasElement.querySelectorAll("[data-amount-part=\"major\"]")
    ).map((part) => part.parentElement);
    expect(roots).toHaveLength(3);
    expect(getComputedStyle(roots[2] as HTMLElement).fontSize).toBe("28px");
    expect(getComputedStyle(roots[2] as HTMLElement).lineHeight).toBe("36px");
  }
};

export const ContextInheritance: Story = {
  render: (args) => (
    <div className="typo-heading-lg text-text-secondary">
      <Amount {...args} />
    </div>
  )
};

export const CompositionContexts: Story = {
  render: (args) => (
    <div className="grid max-w-xl gap-4">
      <div className="flex justify-between typo-body-sm">
        <span>Table cell</span>
        <Amount {...args} className="text-right" />
      </div>
      <div className="flex justify-between typo-body">
        <span>Receipt row</span>
        <Amount {...args} />
      </div>
      <div className="flex justify-between typo-page-title">
        <span>Payment total</span>
        <Amount {...args} minorTone="secondary" />
      </div>
    </div>
  )
};
