import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, DesignSystemProvider, StatusIndicator, Tag } from "@mypoint/ui";
import type { SystemColor } from "@mypoint/ui";

const colors: SystemColor[] = [
  "gray",
  "blue",
  "green",
  "amber",
  "red",
  "purple",
  "brand"
];

function roleStyle(color: SystemColor, role: string): CSSProperties {
  const token = `--ds-system-color-${color}-${role}`;
  return {
    backgroundColor: role.includes("background") ? `var(${token})` : undefined,
    borderColor: `var(--ds-system-color-${color}-border)`,
    color: role === "solid-background"
      ? `var(--ds-system-color-${color}-on-solid)`
      : `var(--ds-system-color-${color}-foreground)`
  };
}

function TokenMatrix() {
  return (
    <div className="grid gap-3">
      {colors.map((color) => (
        <div className="grid grid-cols-5 items-center gap-2" key={color}>
          <span className="typo-body-sm">{color}</span>
          <span className="rounded-lg border p-2" style={roleStyle(color, "soft-background")}>soft</span>
          <span className="rounded-lg border p-2" style={roleStyle(color, "soft-background-hover")}>hover</span>
          <span className="rounded-lg border p-2" style={roleStyle(color, "soft-background-selected")}>selected</span>
          <span className="rounded-lg p-2" style={roleStyle(color, "solid-background")}>solid</span>
        </div>
      ))}
    </div>
  );
}

function ComponentMatrix() {
  return (
    <div className="grid gap-3">
      {colors.map((color) => (
        <div className="flex flex-wrap items-center gap-3" key={color}>
          <span className="typo-body-sm w-16">{color}</span>
          <StatusIndicator color={color} label={`${color} status`} size="md" />
          <Tag color={color}>Static</Tag>
          <Tag color={color} onClick={() => undefined} selected={false}>Off</Tag>
          <Tag color={color} onClick={() => undefined} selected>On</Tag>
          <Tag color={color} onRemove={() => undefined} removeLabel={`Remove ${color}`}>Remove</Tag>
          <Badge color={color}>12</Badge>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "Foundations/SystemColors",
  component: TokenMatrix,
  parameters: { layout: "padded" }
} satisfies Meta<typeof TokenMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SystemColors: Story = {};

export const SystemColorsDark: Story = {
  decorators: [(Story) => <DesignSystemProvider mode="dark"><div className="p-4"><Story /></div></DesignSystemProvider>]
};

export const SystemColorsBrand: Story = {
  decorators: [(Story) => (
    <DesignSystemProvider brand={{ accentColor: "#facc15" }} mode="light">
      <div className="p-4"><Story /></div>
    </DesignSystemProvider>
  )]
};

export const SystemColorComponentMatrix: Story = {
  render: () => <ComponentMatrix />
};
