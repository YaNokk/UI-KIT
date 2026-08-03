import { useState } from "react";
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

function DraftHarness() {
  const [value, setValue] = useState<"2026-08-11" | "2026-09-12">("2026-08-11");
  const [calls, setCalls] = useState(0);
  return (
    <>
      <DatePicker
        commitMode="apply"
        defaultOpen
        label="Date"
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

export const ManualDraftCancelApplyAndReopen: Story = {
  render: () => <DraftHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("textbox", { name: "Date" });
    trigger.focus();
    await userEvent.keyboard("{Control>}a{/Control}09122026");
    await expect(trigger).toHaveValue("09/12/2026");
    await expect(body.getByRole("button", { name: "Open month selection" })).toHaveTextContent("September 2026");
    await expect(canvas.getByTestId("commit-state")).toHaveTextContent("2026-08-11|0");
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await expect(trigger).toHaveValue("08/11/2026");

    await userEvent.click(trigger);
    await userEvent.click(body.getByRole("button", { name: "Open month selection" }));
    await userEvent.click(body.getByRole("button", { name: "Open year selection" }));
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await userEvent.click(trigger);
    await expect(body.getByRole("grid")).toBeVisible();
    trigger.focus();
    await userEvent.keyboard("{Control>}a{/Control}09122026");
    await userEvent.click(body.getByRole("button", { name: "Apply" }));
    await expect(canvas.getByTestId("commit-state")).toHaveTextContent("2026-09-12|1");
  }
};

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
