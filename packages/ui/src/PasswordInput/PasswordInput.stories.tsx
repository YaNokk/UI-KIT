import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { PasswordInput } from "./PasswordInput";

const meta = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  args: {
    autoComplete: "current-password",
    label: "Пароль",
    placeholder: "Введите пароль"
  },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => <div className="w-80 max-w-full"><Story /></div>
  ]
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Visible: Story = { args: { visible: true, value: "secret" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "secret" } };
export const Error: Story = { args: { error: "Пароль обязателен", required: true } };
export const NewPasswordAutocomplete: Story = {
  args: { autoComplete: "new-password", label: "Новый пароль" }
};
export const InnerLabel: Story = {
  args: { labelView: "inner" }
};
export const KeyboardToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Пароль");
    await userEvent.tab();
    await userEvent.tab();
    const toggle = canvas.getByRole("button", { name: "Показать пароль" });
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveAttribute("type", "text");
  }
};
export const InteractiveAdornmentIsolation: Story = {
  args: { labelView: "inner" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Пароль");
    const toggle = canvas.getByRole("button", { name: "Показать пароль" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveFocus();
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).not.toHaveFocus();
  }
};
