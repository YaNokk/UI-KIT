import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { systemColors } from "../internal/system-color/systemColor";
import { StatusIndicator } from "./StatusIndicator";

const meta = {
  title: "Components/StatusIndicator",
  component: StatusIndicator,
  tags: ["autodocs"],
  args: {
    color: "gray",
    size: "sm"
  },
  argTypes: {
    color: { control: "select", options: systemColors },
    size: { control: "select", options: ["sm", "md"] }
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof StatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {systemColors.map((color) => (
        <StatusIndicator color={color} key={color} label={color} />
      ))}
    </div>
  )
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusIndicator color="green" label="Small" size="sm" />
      <StatusIndicator color="green" label="Medium" size="md" />
    </div>
  )
};

export const WithAccessibleLabel: Story = {
  args: { color: "green", label: "Сервис доступен", size: "md" }
};

export const Dark: Story = {
  decorators: [(Story) => <DesignSystemProvider mode="dark"><div className="p-4"><Story /></div></DesignSystemProvider>],
  render: () => <StatusIndicator color="amber" label="Ожидание" size="md" />
};

export const Brand: Story = {
  decorators: [(Story) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case.
    <DesignSystemProvider brand={{ accentColor: "#facc15" }} mode="light">
      <div className="p-4"><Story /></div>
    </DesignSystemProvider>
  )],
  render: () => <StatusIndicator color="brand" label="Бренд" size="md" />
};
