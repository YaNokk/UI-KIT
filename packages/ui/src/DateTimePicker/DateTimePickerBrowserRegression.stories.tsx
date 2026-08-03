import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DateTimePicker } from "./DateTimePicker";

const meta = {
  title: "Internal/DateTimePickerBrowserRegression",
  component: DateTimePicker,
  tags: ["test"]
} satisfies Meta<typeof DateTimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PreservesTimeAndApplies: Story = {
  render: () => (
    <DateTimePicker
      defaultOpen
      defaultValue="2026-08-02T18:30"
      label="Date and time"
      locale="en-US"
      minuteStep={15}
    />
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const presetList = canvasElement.ownerDocument.querySelector<HTMLElement>("[data-date-time-picker-presets]");
    if (!presetList) throw new Error("DateTimePicker presets were not rendered.");
    await expect(getComputedStyle(presetList).gap).toBe("4px");
    await userEvent.click(await body.findByRole("gridcell", { name: "Wednesday, August 5, 2026" }));
    await expect(body.getByRole("textbox", { name: "Choose date and time" })).toHaveValue("08/05/2026, 18:30");
    await expect(body.getByRole("button", { name: "Apply" })).toBeEnabled();
  }
};

export const CompactBottomSheet: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <DateTimePicker defaultOpen label="Дата и время" locale="ru-RU" />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-modal-kind", "bottom-sheet");
    await expect(within(dialog).getByRole("button", { name: "Применить" })).toBeVisible();
  }
};
