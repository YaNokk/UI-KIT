import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { AmountInput } from "../AmountInput/AmountInput";
import { Input } from "../Input/Input";
import { MultiSelect } from "../MultiSelect/MultiSelect";
import { NumberInput } from "../NumberInput/NumberInput";
import { PasswordInput } from "../PasswordInput/PasswordInput";
import { Select } from "../Select/Select";
import type { FieldSize } from "../shared/field";
import { FieldShell } from "./FieldShell";
import styles from "./InnerLabelGeometry.stories.module.css";

const options = [
  { value: "alpha", label: "Альфа", textValue: "Альфа" },
  { value: "beta", label: "Бета", textValue: "Бета" },
  { value: "gamma", label: "Гамма", textValue: "Гамма" }
];

function SelectExample({ size }: { size: FieldSize }) {
  const [value, setValue] = useState<string | null>("alpha");
  return (
    <Select
      block
      items={options}
      label="Категория"
      labelView="inner"
      locale="ru-RU"
      onChange={setValue}
      placeholder="Выберите категорию"
      size={size}
      value={value}
    />
  );
}

function MultiSelectExample({ size }: { size: FieldSize }) {
  const [value, setValue] = useState(["alpha", "beta"]);
  return (
    <MultiSelect
      block
      items={options}
      label="Метки"
      labelView="inner"
      locale="ru-RU"
      onChange={setValue}
      placeholder="Выберите метки"
      size={size}
      value={value}
    />
  );
}

function SizeSection({ size }: { size: FieldSize }) {
  return (
    <section className={styles.section}>
      <strong>{size.toUpperCase()}</strong>
      <div className={styles.grid}>
        <Input
          defaultValue="Иван"
          label="Имя"
          labelView="inner"
          placeholder="Введите имя"
          size={size}
          startAdornment={<Search />}
        />
        <PasswordInput
          defaultValue="password"
          label="Пароль"
          labelView="inner"
          placeholder="Введите пароль"
          size={size}
        />
        <NumberInput
          defaultValue={12}
          label="Количество"
          labelView="inner"
          locale="ru-RU"
          placeholder="Введите количество"
          size={size}
        />
        <AmountInput
          currency="RUB"
          defaultValue={125000}
          label="Сумма"
          labelView="inner"
          locale="ru-RU"
          placeholder="Введите сумму"
          size={size}
        />
        <SelectExample size={size} />
        <MultiSelectExample size={size} />
      </div>
    </section>
  );
}

const meta = {
  title: "Fields/InnerLabelGeometry",
  component: FieldShell,
  parameters: { layout: "fullscreen" }
} satisfies Meta<typeof FieldShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExistingGrid: Story = {
  args: {} as never,
  render: () => (
    <div className={styles.canvas}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <SizeSection key={size} size={size} />
      ))}
    </div>
  )
};

export const EmptyAndStates: Story = {
  args: {} as never,
  render: () => (
    <div className={styles.grid}>
      <Input label="Пустое поле" labelView="inner" placeholder="Placeholder" />
      <Input autoFocus label="Поле в фокусе" labelView="inner" placeholder="Placeholder" />
      <Input error="Ошибка" label="Поле с ошибкой" labelView="inner" value="Значение" />
      <Input disabled label="Disabled" labelView="inner" value="Значение" />
      <Input label="Read only" labelView="inner" readOnly value="Значение" />
      <Select
        block
        collectionState={{ status: "loading" }}
        items={[]}
        label="Загрузка"
        labelView="inner"
        onChange={() => undefined}
        placeholder="Выберите значение"
        value={null}
      />
    </div>
  )
};
