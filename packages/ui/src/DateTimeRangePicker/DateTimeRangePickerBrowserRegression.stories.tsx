import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DateTimeRangePicker } from "./DateTimeRangePicker";
import type { DateTimeRangeValue } from "../internal/date/types";

const meta = {
  title: "Internal/DateTimeRangePickerBrowserRegression",
  component: DateTimeRangePicker,
  args: { timeZone: "Europe/Kaliningrad" },
  tags: ["test"]
} satisfies Meta<typeof DateTimeRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function ManualDraftHarness() {
  const [value, setValue] = useState<DateTimeRangeValue>({ from: "2026-08-11T09:00", to: "2026-08-22T18:00" });
  const [calls, setCalls] = useState(0);
  return (
    <>
      <DateTimeRangePicker
        defaultOpen
        label="Period"
        locale="en-US"
        onChange={(next) => { setCalls((current) => current + 1); setValue(next); }}
        timeZone="Europe/Kaliningrad"
        value={value}
      />
      <output data-testid="commit-count">{calls}</output>
    </>
  );
}

function ControlledRerenderHarness() {
  const [from, setFrom] = useState<DateTimeRangeValue["from"]>("2026-08-11T09:00");
  const [to, setTo] = useState<DateTimeRangeValue["to"]>("2026-08-22T18:00");
  const [revision, setRevision] = useState(0);
  const value = { from, to };
  return (
    <>
      <DateTimeRangePicker
        defaultOpen
        label="Period"
        locale="en-US"
        onChange={(next) => { setFrom(next.from); setTo(next.to); }}
        timeZone="Europe/Kaliningrad"
        value={value}
      />
      <button data-testid="unrelated-rerender" onClick={() => setRevision((current) => current + 1)} type="button">
        Rerender {revision}
      </button>
    </>
  );
}

export const EqualControlledObjectRerender: Story = {
  render: () => <ControlledRerenderHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("textbox", { name: "Period" });
    trigger.focus();
    await userEvent.keyboard("{Control>}a{/Control}091220260930092320261830");
    await expect(trigger).toHaveValue("09/12/2026, 09:30 — 09/23/2026, 18:30");
    canvas.getByTestId("unrelated-rerender").click();
    await waitFor(() => expect(canvas.getByTestId("unrelated-rerender")).toHaveTextContent("Rerender 1"));
    await expect(trigger).toHaveValue("09/12/2026, 09:30 — 09/23/2026, 18:30");
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await expect(trigger).toHaveValue("08/11/2026, 09:00 — 08/22/2026, 18:00");
  }
};

export const Manual1830DraftLifecycle: Story = {
  render: () => <ManualDraftHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("textbox", { name: "Period" });
    trigger.focus();
    await userEvent.keyboard("{Control>}a{/Control}091220260930092320261830");
    await expect(trigger).toHaveValue("09/12/2026, 09:30 — 09/23/2026, 18:30");
    await expect(canvas.getByTestId("commit-count")).toHaveTextContent("0");
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await expect(trigger).toHaveValue("08/11/2026, 09:00 — 08/22/2026, 18:00");
    await userEvent.click(trigger);
    await userEvent.click(body.getByRole("button", { name: "Open month selection" }));
    await userEvent.click(body.getByRole("button", { name: "Open year selection" }));
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await userEvent.click(trigger);
    await expect(body.getAllByRole("grid")).toHaveLength(2);
    trigger.focus();
    await userEvent.keyboard("{Control>}a{/Control}091220260930092320261830");
    await userEvent.click(body.getByRole("button", { name: "Apply" }));
    await expect(canvas.getByTestId("commit-count")).toHaveTextContent("1");
  }
};

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
