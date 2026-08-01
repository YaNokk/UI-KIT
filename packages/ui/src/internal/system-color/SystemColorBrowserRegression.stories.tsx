import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Badge } from "../../Badge/Badge";
import { StatusIndicator } from "../../StatusIndicator/StatusIndicator";
import { Tag } from "../../Tag/Tag";

const removeHandler = fn();

function AccessibilityFixture() {
  const [selected, setSelected] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <Tag
        color="blue"
        onClick={() => setSelected((value) => !value)}
        selected={selected}
      >
        Активные
      </Tag>
      <Tag color="purple" onRemove={removeHandler} removeLabel="Удалить тег Design">
        Design
      </Tag>
      <Tag disabled onClick={() => undefined} selected={false}>Недоступно</Tag>
      <StatusIndicator color="gray" data-testid="decorative-status" />
      <StatusIndicator color="green" label="Сервис доступен" />
      <Badge data-testid="zero-badge">{0}</Badge>
      <Badge color="red" data-testid="max-badge" max={99}>{120}</Badge>
      <Badge label="3 непрочитанных уведомления">3</Badge>
    </div>
  );
}

const meta = {
  title: "Regression/SystemColorAccessibility",
  component: AccessibilityFixture,
  tags: ["test"],
  parameters: { layout: "fullscreen" }
} satisfies Meta<typeof AccessibilityFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeyboardAndSemantics: Story = {
  play: async ({ canvasElement }) => {
    removeHandler.mockClear();
    const canvas = within(canvasElement);
    const selectable = canvas.getByRole("button", { name: "Активные" });
    const removable = canvas.getByRole("button", { name: "Удалить тег Design" });
    const disabled = canvas.getByRole("button", { name: "Недоступно" });

    expect(selectable).toHaveAttribute("aria-pressed", "false");
    await userEvent.tab();
    expect(selectable).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(selectable).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard(" ");
    expect(selectable).toHaveAttribute("aria-pressed", "false");

    await userEvent.tab();
    expect(removable).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(removeHandler).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    expect(removeHandler).toHaveBeenCalledTimes(2);
    expect(disabled).toBeDisabled();
    await userEvent.tab();
    expect(disabled).not.toHaveFocus();

    expect(canvas.getByTestId("decorative-status")).toHaveAttribute("aria-hidden", "true");
    expect(canvas.getByRole("img", { name: "Сервис доступен" })).toBeInTheDocument();
    expect(canvas.getByTestId("zero-badge")).toHaveTextContent("0");
    expect(canvas.getByTestId("max-badge")).toHaveTextContent("99+");
    expect(canvas.getByLabelText("3 непрочитанных уведомления")).toHaveTextContent("3");
  }
};
