import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DateTimeRangePicker } from "./DateTimeRangePicker";

const meta = {
  title: "Internal/DateTimeRangePickerBrowserRegression",
  component: DateTimeRangePicker,
  args: { timeZone: "Europe/Kaliningrad" },
  tags: ["test"]
} satisfies Meta<typeof DateTimeRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SameDayInvalidTime: Story = {
  render: () => (
    <DateTimeRangePicker
      defaultOpen
      defaultValue={{ from: "2026-08-02T18:00", to: "2026-08-02T09:00" }}
      label="Период"
      locale="ru-RU"
      timeZone="Europe/Kaliningrad"
    />
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("Дата или время окончания раньше начала")).toBeVisible();
    await expect(body.getByRole("button", { name: "Применить" })).toBeDisabled();
  }
};

export const CompactStickyActions: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <DateTimeRangePicker defaultOpen label="Период" locale="ru-RU" timeZone="Europe/Kaliningrad" />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-modal-kind", "bottom-sheet");
    await expect(within(dialog).getByRole("button", { name: "Применить" })).toBeVisible();
  }
};
