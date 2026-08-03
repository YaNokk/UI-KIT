import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesignSystemProvider } from "../DesignSystemProvider";
import type { LocalDateTimeValue } from "../internal/date/types";
import { DateTimePicker } from "./DateTimePicker";

const meta = { title: "Fields/DateTimePicker", component: DateTimePicker, args: { label: "Дата и время", locale: "ru-RU" } } satisfies Meta<typeof DateTimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultValue: "2026-08-11T18:30" } };
export const Empty: Story = {};
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<LocalDateTimeValue | null>("2026-08-11T18:30");
    return <DateTimePicker {...args} onChange={setValue} value={value} />;
  }
};
export const RussianProviderLocale: Story = {
  args: { locale: undefined },
  render: (args) => <DesignSystemProvider locale="ru-RU"><DateTimePicker {...args} /></DesignSystemProvider>
};
export const EnglishOverride: Story = { args: { label: "Date and time", locale: "en-US" } };
export const DesktopPopover: Story = { args: { defaultOpen: true, defaultValue: "2026-08-11T18:30" } };
export const MobileBottomSheet: Story = {
  args: { defaultOpen: true, defaultValue: "2026-08-11T18:30" },
  parameters: { viewport: { defaultViewport: "mobile1" } }
};
export const MinuteStep15: Story = { args: { defaultValue: "2026-08-11T18:30", minuteStep: 15 } };
export const MinMax: Story = {
  args: {
    defaultValue: "2026-08-11T18:30",
    minValue: "2026-08-10T09:00",
    maxValue: "2026-08-20T20:00",
    minuteStep: 15
  }
};
export const Presets: Story = {
  args: {
    presets: [{ id: "report-cutoff", label: "Срез отчёта", resolve: () => "2026-08-11T18:30" }]
  }
};
export const ImmediateCommit: Story = { args: { commitMode: "immediate", defaultOpen: true, defaultValue: "2026-08-11T18:30" } };
export const Error: Story = { args: { error: "Проверьте дату и время" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true, value: "2026-08-11T18:30" } };
export const Narrow320: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
export const DarkMode: Story = { globals: { mode: "dark" } };
export const RuntimeBrand: Story = {
  render: (args) => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand stress fixture.
    <DesignSystemProvider brand={{ accentColor: "#7c3aed", foregroundColor: "#ffffff" }} mode="light">
      <DateTimePicker {...args} />
    </DesignSystemProvider>
  )
};
export const RTL: Story = { decorators: [(Story) => <div dir="rtl"><Story /></div>] };
