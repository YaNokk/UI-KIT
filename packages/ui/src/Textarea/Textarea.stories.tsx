import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: {
    label: "Описание",
    placeholder: "Введите описание"
  },
  parameters: { layout: "padded" }
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="grid max-w-2xl gap-4">
      <Textarea {...args} label="Small" size="sm" />
      <Textarea {...args} label="Medium" size="md" />
      <Textarea {...args} label="Large" size="lg" />
    </div>
  )
};

export const OuterLabel: Story = { args: { labelView: "outer" } };
export const InnerLabel: Story = { args: { labelView: "inner" } };
export const Placeholder: Story = { args: { label: undefined } };

function ControlledExample() {
  const [value, setValue] = useState("Управляемое значение");
  return (
    <div className="grid max-w-2xl gap-3">
      <Textarea
        label="Controlled"
        onChange={(event) => setValue(event.currentTarget.value)}
        showCount
        value={value}
      />
      <button onClick={() => setValue("Внешнее обновление\nс новой строкой")} type="button">
        Обновить извне
      </button>
    </div>
  );
}

export const Controlled: Story = { render: () => <ControlledExample /> };
export const Uncontrolled: Story = { args: { defaultValue: "Начальное значение" } };
export const Disabled: Story = { args: { disabled: true, value: "Недоступно" } };
export const ReadOnly: Story = { args: { readOnly: true, value: "Только чтение" } };
export const Error: Story = { args: { error: "Исправьте описание" } };
export const Hint: Story = { args: { hint: "Кратко опишите задачу" } };
export const Required: Story = { args: { required: true } };
export const ResizeNone: Story = { args: { resize: "none" } };
export const ResizeVertical: Story = { args: { resize: "vertical" } };
export const AutoSize: Story = { args: { autoSize: true, minRows: 2 } };
export const AutoSizeMinMaxRows: Story = {
  args: { autoSize: true, minRows: 2, maxRows: 5 }
};
export const CharacterCount: Story = { args: { showCount: true } };
export const MaxLength: Story = { args: { maxLength: 200, showCount: true } };
export const LongContent: Story = {
  args: {
    defaultValue: "Длинное многострочное описание проверяет перенос текста, внутренний скролл и устойчивость геометрии поля.\n\nВторая часть содержит дополнительные детали и длинные слова для проверки узких контейнеров.",
    maxRows: 5,
    autoSize: true
  }
};
export const Narrow320: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: (args) => <div style={{ maxWidth: 320 }}><Textarea {...args} /></div>
};
export const DarkMode: Story = { globals: { mode: "dark" } };
export const ForcedColors: Story = {};
export const RTL: Story = {
  render: (args) => <div dir="rtl"><Textarea {...args} label="תיאור" /></div>
};

export const NativeInteraction: Story = {
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox", { name: "Описание" });
    await userEvent.type(textarea, "Текст");
    await expect(textarea).toHaveValue("Текст");
    await expect(textarea).toHaveFocus();
  }
};
