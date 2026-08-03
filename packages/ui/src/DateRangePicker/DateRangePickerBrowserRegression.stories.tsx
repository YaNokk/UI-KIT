import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DateRangePicker } from "./DateRangePicker";
import type { DateRangeValue } from "../internal/date/types";

const meta = {
  title: "Internal/DateRangePickerBrowserRegression",
  component: DateRangePicker,
  tags: ["test"]
} satisfies Meta<typeof DateRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function Harness() {
  const [value, setValue] = useState<DateRangeValue>({ from: null, to: null });
  return <DateRangePicker label="Период" locale="ru-RU" onChange={setValue} value={value} />;
}

export const DraftApplyAndCancel: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [fromInput] = canvas.getAllByRole("textbox");
    if (!fromInput) throw new Error("Date range start input was not rendered.");
    await userEvent.click(fromInput);
    await userEvent.click(await body.findByRole("button", { name: "Сегодня" }));
    await expect(fromInput).toHaveValue("");
    await userEvent.click(body.getByRole("button", { name: "Применить" }));
    await expect(fromInput).not.toHaveValue("");
  }
};

export const CompactVerticalCalendar: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [fromInput] = canvas.getAllByRole("textbox");
    if (!fromInput) throw new Error("Date range start input was not rendered.");
    await userEvent.click(fromInput);
    const dialog = await body.findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-modal-kind", "bottom-sheet");
    await expect(within(dialog).getAllByRole("grid")).toHaveLength(2);
  }
};
