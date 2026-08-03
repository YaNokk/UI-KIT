import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
  const [calls, setCalls] = useState(0);
  return (
    <>
      <DateRangePicker
        label="Период"
        locale="ru-RU"
        onChange={(next) => { setCalls((current) => current + 1); setValue(next); }}
        value={value}
      />
      <output data-testid="commit-count">{calls}</output>
    </>
  );
}

function ControlledRerenderHarness() {
  const [from, setFrom] = useState<DateRangeValue["from"]>("2026-08-11");
  const [to, setTo] = useState<DateRangeValue["to"]>("2026-08-22");
  const [revision, setRevision] = useState(0);
  const value = { from, to };
  return (
    <>
      <DateRangePicker
        defaultOpen
        label="Period"
        locale="en-US"
        onChange={(next) => { setFrom(next.from); setTo(next.to); }}
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
    await userEvent.keyboard("{Control>}a{/Control}0901202609122026");
    await expect(trigger).toHaveValue("09/01/2026 — 09/12/2026");
    canvas.getByTestId("unrelated-rerender").click();
    await waitFor(() => expect(canvas.getByTestId("unrelated-rerender")).toHaveTextContent("Rerender 1"));
    await expect(trigger).toHaveValue("09/01/2026 — 09/12/2026");
    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await expect(trigger).toHaveValue("08/11/2026 — 08/22/2026");
  }
};

export const DraftApplyAndCancel: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [fromInput] = canvas.getAllByRole("textbox");
    if (!fromInput) throw new Error("Date range start input was not rendered.");
    await userEvent.click(fromInput);
    await userEvent.click(await body.findByRole("button", { name: "Сегодня" }));
    await expect(fromInput).not.toHaveValue("");
    await expect(canvas.getByTestId("commit-count")).toHaveTextContent("0");
    await userEvent.click(body.getByRole("button", { name: "Отмена" }));
    await expect(fromInput).toHaveValue("");
    await userEvent.click(fromInput);
    await userEvent.click(await body.findByRole("button", { name: "Сегодня" }));
    await userEvent.click(body.getByRole("button", { name: "Применить" }));
    await expect(fromInput).not.toHaveValue("");
    await expect(canvas.getByTestId("commit-count")).toHaveTextContent("1");
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
