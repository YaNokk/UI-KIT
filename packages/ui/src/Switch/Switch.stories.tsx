import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Switch } from "./Switch";

function ControlledExample() {
  const [checked, setChecked] = useState(false);
  return <Switch checked={checked} label="Автосохранение" onChange={setChecked} />;
}

const meta = {
  title: "Components/Switch",
  component: Switch,
  args: { label: "Push-уведомления", onChange: fn() },
  argTypes: {
    align: { control: "select", options: ["start", "center"] },
    position: { control: "select", options: ["start", "end"] },
    size: { control: "select", options: ["sm", "md"] }
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"]
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Controlled: Story = { render: () => <ControlledExample /> };
export const Description: Story = { args: { description: "Изменение применяется сразу" } };
export const Error: Story = { args: { error: "Настройка недоступна" } };
export const Disabled: Story = { args: { disabled: true } };

export const KeyboardAndLabelClick: Story = {
  render: () => <Switch label="Доступ по клавиатуре" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch", { name: "Доступ по клавиатуре" });
    await userEvent.tab();
    expect(control).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(control).toBeChecked();
    await userEvent.click(canvas.getByText("Доступ по клавиатуре"));
    expect(control).not.toBeChecked();
  }
};

export const PositionsAndSizes: Story = {
  render: () => <div className="grid gap-4"><Switch label="Small end" size="sm" /><Switch defaultChecked label="Medium end" /><Switch label="Start" position="start" /></div>
};
export const BlockAndLongText: Story = {
  render: () => <div className="w-72"><Switch block description="Переключатель остаётся у края и не сжимается." label="Очень длинная настройка для узкого контейнера" /></div>
};
export const Dark: Story = {
  decorators: [(Story) => <DesignSystemProvider mode="dark"><div className="bg-background-surface p-4"><Story /></div></DesignSystemProvider>],
  render: () => <div className="grid gap-3"><Switch label="Выключено" /><Switch defaultChecked label="Включено" /><Switch disabled label="Недоступно" /></div>
};
export const Brand: Story = {
  decorators: [(Story) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case.
    <DesignSystemProvider brand={{ accentColor: "#facc15" }}><div className="p-4"><Story /></div></DesignSystemProvider>
  )],
  render: () => <Switch defaultChecked label="Яркий бренд" />
};
export const DesignerReference: Story = {
  render: () => <div className="grid gap-3"><Switch label="Тёмная тема" /><Switch defaultChecked label="Push-уведомления" /><Switch defaultChecked label="Автосохранение" /><Switch label="Двойная аутентификация" /></div>
};
