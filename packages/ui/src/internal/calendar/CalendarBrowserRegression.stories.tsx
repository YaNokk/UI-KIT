import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Calendar } from "./Calendar";

const meta = {
  title: "Internal/CalendarBrowserRegression",
  tags: ["test"]
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Harness() {
  const [month, setMonth] = useState(new Date(2026, 7, 1));
  return (
    <div style={{ inlineSize: "100%" }}>
      <Calendar
        locale="ru-RU"
        maxDate="2027-02-20"
        minDate="2026-07-10"
        month={month}
        months={2}
        onMonthChange={setMonth}
        onSelect={() => undefined}
        weekStartsOn={1}
      />
    </div>
  );
}

export const SelectorsAndBounds: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Выберите месяц")).toBeVisible();
    await expect(canvas.getByLabelText("Выберите год")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Следующий месяц" }));
    await expect(canvas.getByText("сентябрь 2026 г.")).toBeVisible();
    await expect(canvasElement.ownerDocument.activeElement).toHaveAttribute("role", "gridcell");
  }
};

export const NarrowNavigation: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>("[data-calendar-viewport]");
    if (!viewport) throw new Error("Calendar viewport was not rendered.");
    await expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
  }
};
