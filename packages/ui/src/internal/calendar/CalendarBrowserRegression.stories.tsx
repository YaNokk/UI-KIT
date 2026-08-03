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

export const ModesAndBounds: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Открыть выбор месяца" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Открыть выбор месяца" }));
    await expect(canvas.getByRole("button", { name: "Открыть выбор года" })).toBeVisible();
    await expect(canvasElement.querySelector("[data-calendar-month-grid]")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Открыть выбор года" }));
    await expect(canvasElement.querySelector("[data-calendar-year-grid]")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "2026" }));
    await userEvent.click(canvas.getByRole("button", { name: "Вернуться к дням календаря" }));
    await userEvent.click(canvas.getByRole("button", { name: "Следующий месяц" }));
    await expect(canvas.getByRole("button", { name: "Открыть выбор месяца" })).toHaveTextContent("сентябрь 2026 г.");
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
