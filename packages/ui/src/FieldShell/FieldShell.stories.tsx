import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";
import { FieldShell } from "./FieldShell";

const meta = {
  title: "Components/FieldShell",
  component: FieldShell,
  tags: ["autodocs"],
  args: {
    children: <input aria-label="Пример" className="min-w-0 flex-1 border-0 bg-transparent outline-none" />
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof FieldShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: (args) => (
    <div className="grid w-80 max-w-full gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <FieldShell {...args} key={size} size={size} />
      ))}
    </div>
  )
};

export const States: Story = {
  render: (args) => (
    <div className="grid w-80 max-w-full gap-3">
      <FieldShell {...args} />
      <FieldShell {...args} invalid />
      <FieldShell {...args} readOnly />
      <FieldShell {...args} disabled />
    </div>
  )
};

export const Adornments: Story = {
  args: {
    startAdornment: <Search aria-hidden="true" />,
    endAdornment: <span>RUB</span>
  }
};

export const InteractiveAdornment: Story = {
  args: {
    endAdornment: <IconButton aria-label="Найти" icon={<Search />} size="sm" />
  }
};
