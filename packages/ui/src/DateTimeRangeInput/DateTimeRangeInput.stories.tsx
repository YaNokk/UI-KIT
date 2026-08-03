import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { DesignSystemProvider } from "../DesignSystemProvider";
import { DateTimeRangeInput } from "./DateTimeRangeInput";

const meta = {
  title: "Fields/DateTimeRangeInput",
  component: DateTimeRangeInput,
  args: { label: "Период", locale: "ru-RU", block: true, minuteStep: 15 }
} satisfies Meta<typeof DateTimeRangeInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultSingleField: Story = {
  args: { defaultValue: { from: "2026-08-01T09:00", to: "2026-08-07T18:00" } }
};
export const Empty: Story = {};
export const MinuteStep15With1830: Story = {
  args: { value: { from: "2026-08-11T09:00", to: "2026-08-22T18:30" } }
};
export const PasteFullRange: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.click(input);
    await userEvent.paste("11.08.2026, 09:00 - 22.08.2026, 18:30");
  }
};
export const PartialSecondBoundary: Story = {
  play: async ({ canvasElement }) => userEvent.type(within(canvasElement).getByRole("textbox"), "1108202609002208")
};
export const InvalidTime: Story = {
  args: { minuteStep: 15 },
  play: async ({ canvasElement }) => userEvent.type(within(canvasElement).getByRole("textbox"), "110820260900220820261820")
};
export const RussianProviderLocale: Story = {
  args: { locale: undefined },
  render: (args) => <DesignSystemProvider locale="ru-RU"><DateTimeRangeInput {...args} /></DesignSystemProvider>
};
export const EnglishOverride: Story = { args: { label: "Period", locale: "en-US" } };
export const Reset: Story = {
  render: (args) => <form><DateTimeRangeInput {...args} defaultValue={{ from: "2026-08-11T09:00", to: "2026-08-22T18:30" }} /><button type="reset">Reset</button></form>
};
export const Error: Story = { args: { error: "Проверьте даты и время" } };
export const Narrow320: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
