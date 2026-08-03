import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "Internal/DatePickerBrowserRegression",
  component: DatePicker,
  tags: ["test"]
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PopoverKeyboardSelection: Story = {
  render: () => <DatePicker label="Дата" locale="ru-RU" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("textbox", { name: "Дата" }));
    const today = await body.findByRole("gridcell", { current: "date" });
    await expect(today).toBeVisible();
    today.focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(body.queryByRole("grid")).not.toBeInTheDocument();
  }
};

export const CompactBottomSheet: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <DatePicker label="Дата" locale="ru-RU" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("textbox", { name: "Дата" }));
    await expect(await body.findByRole("dialog")).toHaveAttribute("data-modal-kind", "bottom-sheet");
  }
};
