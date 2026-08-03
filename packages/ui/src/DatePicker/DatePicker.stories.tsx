import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "Date/DatePicker",
  component: DatePicker,
  args: { label: "Дата", locale: "ru-RU" }
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultValue: "2026-08-02" } };
export const ApplyMode: Story = { args: { commitMode: "apply", defaultOpen: true } };
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("textbox", { name: "Дата" }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("grid")).toBeVisible();
  }
};
export const Narrow320: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
export const Disabled: Story = { args: { disabled: true } };
