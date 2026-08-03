import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateTimeInput } from "./DateTimeInput";

const meta = {
  title: "Fields/DateTimeInput",
  component: DateTimeInput,
  args: { label: "Дата и время", locale: "ru-RU", block: true }
} satisfies Meta<typeof DateTimeInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultValue: "2026-08-02T09:30" } };
export const English: Story = { args: { defaultValue: "2026-08-02T09:30", locale: "en-US" } };
export const Error: Story = { args: { error: "Проверьте дату и время" } };
export const Disabled: Story = { args: { defaultValue: "2026-08-02T09:30", disabled: true } };
