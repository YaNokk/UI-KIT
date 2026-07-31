import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "../Input/Input";
import { MultiSelect } from "../MultiSelect/MultiSelect";
import { Select } from "../Select/Select";
import { FieldShell } from "./FieldShell";
import styles from "./InnerLabelGeometry.stories.module.css";

const options = [
  { value: "one", label: "Первый", textValue: "Первый" },
  { value: "two", label: "Второй", textValue: "Второй" }
];

function ClickTargets() {
  const [single, setSingle] = useState<string | null>(null);
  const [multiple, setMultiple] = useState<string[]>([]);
  return (
    <div className={styles.clickGrid}>
      <Input label="Название" labelView="inner" placeholder="Введите название" />
      <Input id="outer-label-target" label="Внешний label" placeholder="Введите значение" />
      <Select
        block
        items={options}
        label="Один вариант"
        labelView="inner"
        locale="ru-RU"
        onChange={setSingle}
        placeholder="Выберите вариант"
        value={single}
      />
      <MultiSelect
        block
        items={options}
        label="Несколько вариантов"
        labelView="inner"
        locale="ru-RU"
        onChange={setMultiple}
        placeholder="Выберите варианты"
        value={multiple}
      />
      <p className={styles.instruction}>
        Клик по верхней зоне внутреннего label должен фокусировать Input или
        открывать Select/MultiSelect. Сам label не перехватывает pointer events.
      </p>
    </div>
  );
}

const meta = {
  title: "Fields/InnerLabelClickBehavior",
  component: FieldShell,
  parameters: { layout: "centered" }
} satisfies Meta<typeof FieldShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PointerTransparentLabel: Story = {
  args: {} as never,
  render: () => <ClickTargets />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    const input = canvas.getByRole("textbox", { name: "Название" });
    const inputLabel = canvas.getByText("Название", { selector: "label" });
    const inputLabelRect = inputLabel.getBoundingClientRect();
    const inputHit = document.elementFromPoint(
      inputLabelRect.left + inputLabelRect.width / 2,
      inputLabelRect.top + inputLabelRect.height / 2
    );
    expect(inputHit).toBe(input);
    expect(getComputedStyle(input, "::placeholder").color)
      .toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    await userEvent.click(inputHit as HTMLElement);
    expect(input).toHaveFocus();
    expect(getComputedStyle(input, "::placeholder").color)
      .not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);

    const single = canvas.getByRole("button", { name: "Один вариант" });
    const singleLabel = canvas.getByText("Один вариант", { selector: "label" });
    const singlePlaceholder = single.querySelector<HTMLElement>(
      "[data-field-placeholder]"
    );
    expect(singlePlaceholder).not.toBeNull();
    expect(getComputedStyle(singlePlaceholder as HTMLElement).visibility)
      .toBe("hidden");
    const singleLabelRect = singleLabel.getBoundingClientRect();
    const singleHit = document.elementFromPoint(
      singleLabelRect.left + singleLabelRect.width / 2,
      singleLabelRect.top + singleLabelRect.height / 2
    );
    expect(singleHit).toBe(single);
    await userEvent.click(singleHit as HTMLElement);
    expect(single).toHaveAttribute("aria-expanded", "true");
    expect(getComputedStyle(singlePlaceholder as HTMLElement).visibility)
      .toBe("visible");
    await userEvent.keyboard("{Escape}");

    const multiple = canvas.getByRole("button", {
      name: "Несколько вариантов"
    });
    const multipleLabel = canvas.getByText("Несколько вариантов", {
      selector: "label"
    });
    const multipleLabelRect = multipleLabel.getBoundingClientRect();
    const multipleHit = document.elementFromPoint(
      multipleLabelRect.left + multipleLabelRect.width / 2,
      multipleLabelRect.top + multipleLabelRect.height / 2
    );
    expect(multipleHit).toBe(multiple);
    await userEvent.click(multipleHit as HTMLElement);
    expect(multiple).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");

    const outerInput = canvas.getByRole("textbox", { name: "Внешний label" });
    await userEvent.click(canvas.getByText("Внешний label", { selector: "label" }));
    expect(outerInput).toHaveFocus();
  }
};
