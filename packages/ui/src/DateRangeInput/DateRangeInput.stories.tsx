import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateRangeInput } from "./DateRangeInput";

const meta = {
  title: "Fields/DateRangeInput",
  component: DateRangeInput,
  args: { label: "Период", locale: "ru-RU", block: true }
} satisfies Meta<typeof DateRangeInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultValue: { from: "2026-08-01", to: "2026-08-07" } } };
export const Empty: Story = {};
export const Error: Story = { args: { error: "Укажите обе границы" } };
export const Narrow320: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
