import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CheckboxGroup } from "./CheckboxGroup";

const options = [
  { description: "Письма о важных событиях", label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { disabled: true, label: "Push", value: "push" }
] as const;

function ControlledExample() {
  const [value, setValue] = useState<readonly (typeof options)[number]["value"][]>(["email"]);
  return <CheckboxGroup label="Каналы" onChange={setValue} options={options} value={value} />;
}

const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  args: { label: "Каналы уведомлений", onChange: fn(), options },
  tags: ["autodocs"]
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Controlled: Story = { render: () => <ControlledExample /> };
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Disabled: Story = { args: { defaultValue: ["email"], disabled: true } };
export const Error: Story = { args: { description: "Выберите хотя бы один канал", error: "Канал обязателен" } };
export const Required: Story = { args: { required: true } };
export const Block: Story = { args: { block: true } };

export const FormSubmission: Story = {
  render: () => (
    <form data-testid="form">
      <CheckboxGroup defaultValue={["email", "sms"]} label="Каналы" name="channels" options={options} />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).getAll("channels")).toEqual(["email", "sms"]);
    await userEvent.click(canvas.getByRole("checkbox", { name: "SMS" }));
    expect(new FormData(form).getAll("channels")).toEqual(["email"]);
  }
};

export const LongLabels: Story = {
  decorators: [(Story) => <div className="w-72"><Story /></div>],
  args: {
    options: [
      { label: "Очень длинный вариант, который переносится без потери кликабельной области", value: "long" },
      { label: "Короткий вариант", value: "short" }
    ]
  }
};
