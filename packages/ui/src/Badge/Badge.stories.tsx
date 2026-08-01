import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { systemColors } from "../internal/system-color/systemColor";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: 3, color: "gray" },
  argTypes: { color: { control: "select", options: systemColors } },
  parameters: { layout: "centered" }
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = { render: () => <div className="flex items-center gap-3">{systemColors.map((color) => <Badge color={color} key={color}>3</Badge>)}</div> };
export const Numbers: Story = { render: () => <div className="flex items-center gap-3"><Badge>3</Badge><Badge>12</Badge><Badge>120</Badge></div> };
export const Symbol: Story = { args: { children: "!", color: "amber" } };
export const Zero: Story = { args: { children: 0 } };
export const WithMax: Story = { args: { children: 120, color: "red", max: 99 } };
export const WithoutMax: Story = { args: { children: 120, color: "blue" } };
export const LongValue: Story = { args: { children: "NEW" } };
export const Dark: Story = {
  decorators: [(Story) => <DesignSystemProvider mode="dark"><div className="p-4"><Story /></div></DesignSystemProvider>],
  render: () => <div className="flex gap-3"><Badge color="amber">!</Badge><Badge color="purple">99+</Badge></div>
};
export const Brand: Story = {
  decorators: [(Story) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case.
    <DesignSystemProvider brand={{ accentColor: "#facc15" }}>
      <div className="p-4"><Story /></div>
    </DesignSystemProvider>
  )],
  render: () => <Badge color="brand" label="12 новых событий">12</Badge>
};
export const BrandDefaultBlue: Story = {
  render: () => <Badge color="brand">12</Badge>
};
export const BrandLightYellow: Story = Brand;
export const BrandLightGreen: Story = {
  decorators: [(Story) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case.
    <DesignSystemProvider brand={{ accentColor: "#86efac" }}><div className="p-4"><Story /></div></DesignSystemProvider>
  )],
  render: () => <Badge color="brand">12</Badge>
};
export const BrandDark: Story = {
  decorators: [(Story) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case.
    <DesignSystemProvider brand={{ accentColor: "#7f1d1d" }} mode="dark"><div className="p-4"><Story /></div></DesignSystemProvider>
  )],
  render: () => <Badge color="brand">12</Badge>
};
export const BrandExplicitForeground: Story = {
  decorators: [(Story) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case.
    <DesignSystemProvider brand={{ accentColor: "#facc15", foregroundColor: "#111827" }}><div className="p-4"><Story /></div></DesignSystemProvider>
  )],
  render: () => <Badge color="brand">12</Badge>
};
export const DesignerReference: Story = {
  render: () => <div className="flex items-center gap-3"><Badge color="red">3</Badge><Badge color="blue">12</Badge><Badge color="green">99</Badge><Badge color="amber">!</Badge></div>
};
