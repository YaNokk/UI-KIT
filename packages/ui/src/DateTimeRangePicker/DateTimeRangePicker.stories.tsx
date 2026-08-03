import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateTimeRangePicker } from "./DateTimeRangePicker";

const meta = {
  title: "Date/DateTimeRangePicker",
  component: DateTimeRangePicker,
  args: {
    label: "Период и время",
    locale: "ru-RU",
    timeZone: "Europe/Kaliningrad",
    minuteStep: 15,
    block: true
  }
} satisfies Meta<typeof DateTimeRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: { from: "2026-08-01T09:00", to: "2026-08-07T18:00" } }
};
export const OpenDesktop: Story = { args: { defaultOpen: true } };
export const SameDayInvalidTime: Story = {
  args: { defaultOpen: true, defaultValue: { from: "2026-08-02T18:00", to: "2026-08-02T09:00" } }
};
export const Narrow320: Story = {
  args: { defaultOpen: true },
  parameters: { viewport: { defaultViewport: "mobile1" } }
};
