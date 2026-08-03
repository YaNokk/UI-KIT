import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DateRangePicker } from "./DateRangePicker";

const meta = {
  title: "Date/DateRangePicker",
  component: DateRangePicker,
  args: { label: "Период", locale: "ru-RU", block: true }
} satisfies Meta<typeof DateRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultValue: { from: "2026-08-01", to: "2026-08-07" } } };
export const OpenDesktop: Story = { args: { defaultOpen: true } };
export const DraftApply: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [fromInput] = canvas.getAllByRole("textbox");
    if (!fromInput) throw new Error("Date range start input was not rendered.");
    await userEvent.click(fromInput);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("button", { name: "Сегодня" }));
    await expect(body.getByRole("button", { name: "Применить" })).toBeEnabled();
  }
};
export const Narrow320: Story = {
  args: { defaultOpen: true },
  parameters: { viewport: { defaultViewport: "mobile1" } }
};
export const RTL: Story = { decorators: [(Story) => <div dir="rtl"><Story /></div>] };
export const Disabled: Story = { args: { disabled: true } };
