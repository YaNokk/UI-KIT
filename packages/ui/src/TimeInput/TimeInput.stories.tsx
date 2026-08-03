import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimeInput } from "./TimeInput";

const meta = {
  title: "Fields/TimeInput",
  component: TimeInput,
  args: { label: "Время", minuteStep: 15 }
} satisfies Meta<typeof TimeInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultValue: "10:15" } };
export const Empty: Story = {};
export const Disabled: Story = { args: { defaultValue: "10:15", disabled: true } };
export const Error: Story = { args: { error: "Время недоступно" } };
