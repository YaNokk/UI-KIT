import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RadioGroup } from "./RadioGroup";

const options = [
  { label: "Ежедневно", value: "daily" },
  { description: "Каждый понедельник", label: "Еженедельно", value: "weekly" },
  { disabled: true, label: "Ежемесячно", value: "monthly" }
] as const;

function ControlledExample() {
  const [value, setValue] = useState<(typeof options)[number]["value"] | null>("daily");
  return <RadioGroup label="Частота" onChange={setValue} options={options} value={value} />;
}

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  args: { label: "Частота отчёта", onChange: fn(), options },
  tags: ["autodocs"]
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Controlled: Story = { render: () => <ControlledExample /> };
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Disabled: Story = { args: { defaultValue: "daily", disabled: true } };
export const Required: Story = { args: { required: true } };
export const Error: Story = { args: { description: "Выберите период", error: "Период обязателен" } };

export const KeyboardNavigation: Story = {
  args: { defaultValue: "daily", name: "keyboard-frequency" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const daily = canvas.getByRole("radio", { name: "Ежедневно" });
    const weekly = canvas.getByRole("radio", { name: "Еженедельно" });
    daily.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(weekly).toBeChecked();
    expect(weekly).toHaveFocus();
  }
};

export const FormSubmission: Story = {
  render: () => <form data-testid="form"><RadioGroup defaultValue="weekly" label="Частота" name="frequency" options={options} /></form>,
  play: async ({ canvasElement }) => {
    const form = within(canvasElement).getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).get("frequency")).toBe("weekly");
  }
};
