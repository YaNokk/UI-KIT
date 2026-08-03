import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateInput } from "./DateInput";

const meta = {
  title: "Fields/DateInput",
  component: DateInput,
  args: { label: "Дата", locale: "ru-RU", block: true }
} satisfies Meta<typeof DateInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultValue: "2026-08-02" } };
export const Empty: Story = {};
export const Error: Story = { args: { error: "Введите корректную дату" } };
export const Disabled: Story = { args: { defaultValue: "2026-08-02", disabled: true } };
export const ReadOnly: Story = { args: { defaultValue: "2026-08-02", readOnly: true } };
export const English: Story = { args: { defaultValue: "2026-08-02", locale: "en-US" } };
