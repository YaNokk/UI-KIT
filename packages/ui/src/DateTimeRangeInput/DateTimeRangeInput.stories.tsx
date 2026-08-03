import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateTimeRangeInput } from "./DateTimeRangeInput";

const meta = {
  title: "Fields/DateTimeRangeInput",
  component: DateTimeRangeInput,
  args: { label: "Период", locale: "ru-RU", block: true, minuteStep: 15 }
} satisfies Meta<typeof DateTimeRangeInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: { from: "2026-08-01T09:00", to: "2026-08-07T18:00" } }
};
export const Empty: Story = {};
export const Error: Story = { args: { error: "Проверьте даты и время" } };
export const Narrow320: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
