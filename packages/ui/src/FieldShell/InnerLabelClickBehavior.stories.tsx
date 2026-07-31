import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
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
  render: () => <ClickTargets />
};
