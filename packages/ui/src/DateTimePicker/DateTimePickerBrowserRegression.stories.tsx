import { useState } from "react";
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

function ManualDraftHarness() {
  const [value, setValue] = useState<"2026-08-11T18:30" | "2026-09-12T09:30">("2026-08-11T18:30");
  const [calls, setCalls] = useState(0);
  return (
    <>
      <DateTimePicker
        defaultOpen
        label="Date and time"
        locale="en-US"
        onChange={(next) => {
          setCalls((current) => current + 1);
          setValue(next as typeof value);
        }}
        value={value}
      />
      <output data-testid="commit-state">{value}|{calls}</output>
    </>
  );
}

export const ApplyModeManualDraftLifecycle: Story = {
  render: () => <ManualDraftHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("textbox", { name: "Date and time" });
    trigger.focus();
    await userEvent.keyboard("{Control>}a{/Control}091220260930");
    await expect(trigger).toHaveValue("09/12/2026, 09:30");
    await expect(canvas.getByTestId("commit-state")).toHaveTextContent("2026-08-11T18:30|0");
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await expect(trigger).toHaveValue("08/11/2026, 18:30");
    await userEvent.click(trigger);
    await userEvent.click(body.getByRole("button", { name: "Open month selection" }));
    await userEvent.click(body.getByRole("button", { name: "Open year selection" }));
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await userEvent.click(trigger);
    await expect(body.getByRole("grid")).toBeVisible();
    trigger.focus();
    await userEvent.keyboard("{Control>}a{/Control}091220260930");
    await userEvent.click(body.getByRole("button", { name: "Apply" }));
    await expect(canvas.getByTestId("commit-state")).toHaveTextContent("2026-09-12T09:30|1");
  }
};

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
