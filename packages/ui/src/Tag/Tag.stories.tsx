import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { systemColors } from "../internal/system-color/systemColor";
import { Tag } from "./Tag";

function SelectableExample() {
  const [selected, setSelected] = useState(false);
  return <Tag color="blue" onClick={() => setSelected((value) => !value)} selected={selected}>Активные</Tag>;
}

function RemovableExample() {
  const [visible, setVisible] = useState(true);
  return visible
    ? <Tag color="purple" onRemove={() => setVisible(false)} removeLabel="Удалить тег Design">Design</Tag>
    : <span className="typo-body-sm">Тег удалён</span>;
}

const meta = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
  args: { children: "Статус", color: "gray", size: "md" },
  argTypes: {
    color: { control: "select", options: systemColors },
    size: { control: "select", options: ["sm", "md"] }
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => <div className="flex flex-wrap gap-2">{systemColors.map((color) => <Tag color={color} key={color}>{color}</Tag>)}</div>
};

export const Sizes: Story = {
  render: () => <div className="flex items-center gap-2"><Tag size="sm">Small</Tag><Tag size="md">Medium</Tag></div>
};

export const Static: Story = {};
export const WithDot: Story = { render: () => <Tag color="green" dot>Online</Tag> };

export const Selectable: Story = {
  render: () => <SelectableExample />,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Активные" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
  }
};

export const SelectableSelected: Story = {
  render: () => <Tag color="blue" onClick={fn()} selected>Выбрано</Tag>
};

export const Removable: Story = {
  render: () => <RemovableExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Удалить тег Design" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(canvas.getByText("Тег удалён")).toBeInTheDocument();
  }
};

export const Disabled: Story = {
  render: () => <div className="flex gap-2"><Tag disabled>Static</Tag><Tag disabled onClick={fn()} selected={false}>Selectable</Tag></div>
};

export const LongText: Story = {
  decorators: [(Story) => <div className="max-w-48"><Story /></div>],
  render: () => <Tag>Очень длинное название статуса для узкого контейнера</Tag>
};

export const Dark: Story = {
  decorators: [(Story) => <DesignSystemProvider mode="dark"><div className="p-4"><Story /></div></DesignSystemProvider>],
  render: () => <div className="flex gap-2"><Tag color="red">Ошибка</Tag><Tag color="brand" dot>Brand</Tag></div>
};

export const Brand: Story = {
  decorators: [(Story) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case.
    <DesignSystemProvider brand={{ accentColor: "#facc15" }}>
      <div className="p-4"><Story /></div>
    </DesignSystemProvider>
  )],
  render: () => <Tag color="brand" onClick={fn()} selected>Яркий бренд</Tag>
};

export const DesignerReference: Story = {
  render: () => (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">{systemColors.map((color) => <Tag color={color} key={color}>{color}</Tag>)}</div>
      <div className="flex flex-wrap gap-2"><Tag color="green" dot>Online</Tag><Tag color="blue" dot>Processing</Tag><Tag color="red" dot>Error</Tag></div>
    </div>
  )
};
