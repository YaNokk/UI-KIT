import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Textarea } from "./Textarea";

const meta = {
  title: "Internal/TextareaBrowserRegression",
  component: Textarea,
  parameters: { layout: "padded" }
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NativeGeometryAndSemantics: Story = {
  args: {} as never,
  render: () => (
    <div className="grid max-w-2xl gap-4">
      <Textarea
        data-testid="inner-textarea"
        error="Исправьте описание"
        hint="Подсказка заменяется ошибкой"
        id="browser-textarea"
        label="Описание"
        labelView="inner"
        placeholder="Введите описание"
        required
      />
      <Textarea aria-label="Disabled textarea" disabled />
      <Textarea aria-label="Read-only textarea" readOnly value="Доступно для чтения" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId("inner-textarea");
    await expect(textarea.tagName).toBe("TEXTAREA");
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    await expect(textarea).toHaveAttribute(
      "aria-describedby",
      "browser-textarea-error"
    );
    await expect(textarea).toBeRequired();
    await expect(canvas.queryByText("Подсказка заменяется ошибкой"))
      .not.toBeInTheDocument();

    await userEvent.click(textarea);
    const shell = textarea.closest<HTMLElement>("[data-multiline]");
    const label = canvas.getByText("Описание", { selector: "label" });
    if (!shell) throw new Error("Multiline FieldShell was not rendered.");
    const textareaRect = textarea.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const paddingTop = Number.parseFloat(getComputedStyle(textarea).paddingBlockStart);
    await expect(labelRect.bottom).toBeLessThanOrEqual(
      textareaRect.top + paddingTop + 1
    );
    await expect(Number.parseFloat(getComputedStyle(shell).outlineWidth))
      .toBeGreaterThan(0);
    await expect(canvas.getByLabelText("Disabled textarea")).toBeDisabled();
    await expect(canvas.getByLabelText("Read-only textarea"))
      .toHaveAttribute("readonly");
  }
};

function AutosizeFixture() {
  const [value, setValue] = useState("Одна строка");
  return (
    <div className="grid max-w-xl gap-3">
      <Textarea
        aria-label="Autosize browser"
        autoSize
        maxRows={4}
        minRows={2}
        onChange={(event) => setValue(event.currentTarget.value)}
        value={value}
      />
      <button
        onClick={() => setValue("Первая\nВторая\nТретья\nЧетвертая\nПятая\nШестая")}
        type="button"
      >
        Установить длинное значение
      </button>
    </div>
  );
}

export const AutosizeGrowthAndControlledRecalculation: Story = {
  args: {} as never,
  render: () => <AutosizeFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", {
      name: "Autosize browser"
    }) as HTMLTextAreaElement;
    const initialHeight = textarea.getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole("button", { name: "Установить длинное значение" }));
    const grownHeight = textarea.getBoundingClientRect().height;
    const computed = getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(computed.lineHeight);
    const padding = Number.parseFloat(computed.paddingBlockStart)
      + Number.parseFloat(computed.paddingBlockEnd);
    const maxHeight = lineHeight * 4 + padding + 1;
    await expect(grownHeight).toBeGreaterThan(initialHeight);
    await expect(grownHeight).toBeLessThanOrEqual(maxHeight);
    await expect(computed.overflowY).toBe("auto");
  }
};

export const CaretPreservedDuringResizeOnlyMeasurement: Story = {
  args: {} as never,
  render: () => (
    <div data-testid="caret-resize-container" style={{ maxWidth: "100%", width: 512 }}>
      <Textarea
        aria-label="Resize-only caret"
        autoSize
        defaultValue="Длинное содержимое проверяет перенос строк при изменении ширины без изменения самого значения. Позиция выделения должна оставаться стабильной во время повторного измерения высоты."
        maxRows={8}
        minRows={2}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("caret-resize-container");
    const textarea = canvas.getByRole("textbox", {
      name: "Resize-only caret"
    }) as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(7, 18);
    const initialHeight = textarea.getBoundingClientRect().height;

    container.style.width = "256px";
    await waitFor(() => {
      expect(textarea.getBoundingClientRect().height).toBeGreaterThan(initialHeight);
    });
    await expect(textarea).toHaveFocus();
    await expect(textarea.selectionStart).toBe(7);
    await expect(textarea.selectionEnd).toBe(18);
  }
};

export const NarrowCounterAndResize: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Textarea
        aria-label="Narrow textarea"
        hint="Текст переносится внутри доступной ширины"
        maxLength={200}
        resize="vertical"
        showCount
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "Narrow textarea" });
    const shell = textarea.closest<HTMLElement>("[data-multiline]");
    if (!shell) throw new Error("Multiline FieldShell was not rendered.");
    const initialHeight = shell.getBoundingClientRect().height;
    await userEvent.type(textarea, "Длинный текст для проверки счётчика и переноса на узкой ширине");
    await expect(canvas.getByText("62 / 200")).toBeInTheDocument();
    await expect(Math.abs(shell.getBoundingClientRect().height - initialHeight))
      .toBeLessThan(1);
    await expect(getComputedStyle(textarea).resize).toBe("vertical");
    await expect(textarea.getBoundingClientRect().width).toBeLessThanOrEqual(320);
  }
};

export const Rtl: Story = {
  args: {} as never,
  render: () => (
    <div dir="rtl" style={{ maxWidth: 480 }}>
      <Textarea
        defaultValue="תוכן רב שורות"
        label="תיאור"
        labelView="inner"
        showCount
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox", { name: "תיאור" });
    await expect(getComputedStyle(textarea).direction).toBe("rtl");
    await expect(textarea).toHaveAttribute("data-label-view", "inner");
  }
};

export const ForcedColors: Story = {
  args: {} as never,
  tags: ["forced-colors-only"],
  render: () => (
    <Textarea
      defaultValue="Текст остаётся читаемым в системной цветовой схеме"
      error="Системный контраст сохраняется"
      label="Forced colors textarea"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", {
      name: "Forced colors textarea"
    }) as HTMLTextAreaElement;
    const shell = textarea.closest<HTMLElement>("[data-multiline]");
    if (!shell) throw new Error("Multiline FieldShell was not rendered.");

    await expect(window.matchMedia("(forced-colors: active)").matches).toBe(true);
    textarea.focus();
    await expect(textarea.getBoundingClientRect().width).toBeGreaterThan(0);
    await expect(textarea.getBoundingClientRect().height).toBeGreaterThan(0);
    await expect(getComputedStyle(textarea).visibility).not.toBe("hidden");
    await expect(textarea.value.length).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(shell).outlineWidth))
      .toBeGreaterThan(0);

    await expect(getComputedStyle(shell).borderStyle).not.toBe("none");
    await expect(getComputedStyle(textarea).forcedColorAdjust).not.toBe("none");
  }
};
