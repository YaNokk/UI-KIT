import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Checkbox } from "./Checkbox";

function ControlledExample() {
  const [checked, setChecked] = useState(false);
  return <Checkbox checked={checked} label="Получать новости" onChange={setChecked} />;
}

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { label: "Принять условия", onChange: fn() },
  argTypes: {
    align: { control: "select", options: ["start", "center"] },
    position: { control: "select", options: ["start", "end"] },
    size: { control: "select", options: ["sm", "md"] }
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"]
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { indeterminate: true, label: "Выбрать всё" } };
export const Description: Story = { args: { description: "Уведомления о новых предложениях" } };
export const Error: Story = { args: { error: "Подтвердите согласие" } };
export const Disabled: Story = { args: { disabled: true } };
export const Controlled: Story = { render: () => <ControlledExample /> };

export const KeyboardAndLabelClick: Story = {
  render: () => <Checkbox label="Доступ по клавиатуре" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Доступ по клавиатуре" });
    await userEvent.tab();
    expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(checkbox).toBeChecked();
    await userEvent.click(canvas.getByText("Доступ по клавиатуре"));
    expect(checkbox).not.toBeChecked();
  }
};

export const PositionsAndSizes: Story = {
  render: () => (
    <div className="grid gap-4">
      <Checkbox label="Small start" size="sm" />
      <Checkbox label="Medium start" size="md" />
      <Checkbox label="Small end" position="end" size="sm" />
      <Checkbox label="Medium end" position="end" size="md" />
    </div>
  )
};

export const BlockAndLongText: Story = {
  render: () => (
    <div className="w-72">
      <Checkbox
        block
        description="Вся строка остаётся кликабельной, а текст переносится в узком контейнере."
        label="Очень длинная подпись выбора для проверки переноса текста"
      />
    </div>
  )
};

export const Dark: Story = {
  decorators: [(Story) => <DesignSystemProvider mode="dark"><div className="bg-background-surface p-4"><Story /></div></DesignSystemProvider>],
  render: () => <div className="grid gap-3"><Checkbox label="Не выбрано" /><Checkbox defaultChecked label="Выбрано" /><Checkbox disabled label="Недоступно" /></div>
};

export const Brand: Story = {
  decorators: [(Story) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case.
    <DesignSystemProvider brand={{ accentColor: "#facc15" }}><div className="p-4"><Story /></div></DesignSystemProvider>
  )],
  render: () => <Checkbox defaultChecked label="Яркий бренд" />
};

export const DesignerReference: Story = {
  render: () => <div className="grid gap-3"><Checkbox indeterminate label="Выбрать всё" /><Checkbox defaultChecked label="Отправить уведомления" /><Checkbox label="Принять условия" /><Checkbox disabled label="Недоступный вариант" /></div>
};
