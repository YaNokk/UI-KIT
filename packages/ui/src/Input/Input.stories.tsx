import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mail, Search } from "lucide-react";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    label: "Название",
    placeholder: "Введите значение",
    size: "md"
  },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => <div className="w-80 max-w-full"><Story /></div>
  ]
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <div className="grid gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Input {...args} key={size} label={`Размер ${size}`} size={size} />
      ))}
    </div>
  )
};
export const Description: Story = {
  args: { description: "Краткое пояснение назначения поля" }
};
export const Error: Story = {
  args: { error: "Введите корректное значение" }
};
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Недоступно" } };
export const ReadOnly: Story = { args: { readOnly: true, value: "Можно выделить и скопировать" } };
export const Adornments: Story = {
  args: {
    startAdornment: <Search aria-hidden="true" />,
    endAdornment: <span>RUB</span>
  }
};
export const DecorativeIcon: Story = {
  args: { startAdornment: <Mail aria-hidden="true" />, type: "email" }
};
export const LongValue: Story = {
  args: { defaultValue: "Очень длинное значение поля, которое продолжает работать как обычный native input" }
};
export const Uncontrolled: Story = { args: { defaultValue: "Начальное значение" } };
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("Управляемое значение");
    return (
      <Input
        {...args}
        onChange={(event) => setValue(event.currentTarget.value)}
        value={value}
      />
    );
  }
};
export const Autocomplete: Story = {
  args: {
    autoComplete: "email",
    description: "Используется нативный browser autofill",
    label: "Email",
    name: "email",
    type: "email"
  }
};
