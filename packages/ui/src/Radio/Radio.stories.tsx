import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Radio } from "./Radio";

const meta = {
  title: "Components/Radio",
  component: Radio,
  args: { label: "Ежедневно", name: "frequency", value: "daily" },
  argTypes: {
    align: { control: "select", options: ["start", "center"] },
    position: { control: "select", options: ["start", "end"] },
    size: { control: "select", options: ["sm", "md"] }
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"]
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Description: Story = { args: { description: "Отчёт будет приходить каждый день" } };
export const Disabled: Story = { args: { disabled: true } };
export const PositionsAndSizes: Story = {
  render: () => <div className="grid gap-4"><Radio label="Small" size="sm" /><Radio defaultChecked label="Medium" size="md" /><Radio label="End" position="end" /></div>
};
export const BlockAndLongText: Story = {
  render: () => <div className="w-72"><Radio block description="Описание переносится отдельно от основной подписи." label="Длинная подпись варианта в узком контейнере" /></div>
};
export const Dark: Story = {
  decorators: [(Story) => <DesignSystemProvider mode="dark"><div className="bg-background-surface p-4"><Story /></div></DesignSystemProvider>],
  render: () => <div className="grid gap-3"><Radio defaultChecked label="Выбрано" /><Radio label="Не выбрано" /><Radio disabled label="Недоступно" /></div>
};
export const DesignerReference: Story = {
  render: () => <div className="grid gap-3"><Radio defaultChecked label="Ежедневно" name="designer" /><Radio label="Еженедельно" name="designer" /><Radio disabled label="Недоступный вариант" /></div>
};
