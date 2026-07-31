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

const matrixRows = [
  "empty",
  "focused",
  "value",
  "long-label",
  "long-placeholder",
  "leading",
  "end",
  "error",
  "disabled",
  "read-only",
  "loading",
  "select-value",
  "multi-value"
] as const;

type MatrixRow = (typeof matrixRows)[number];

const matrixLabels: Record<MatrixRow, string> = {
  empty: "Empty resting",
  focused: "Focused empty",
  value: "Value",
  "long-label": "Long label",
  "long-placeholder": "Long placeholder",
  leading: "Leading adornment",
  end: "End adornment",
  error: "Error",
  disabled: "Disabled",
  "read-only": "Read only",
  loading: "Loading",
  "select-value": "Select value",
  "multi-value": "MultiSelect value"
};

function MatrixField({ row, size }: { row: MatrixRow; size: FieldSize }) {
  if (row === "focused") {
    return (
      <Input
        autoFocus={size === "lg"}
        label="Поле в фокусе"
        labelView="inner"
        placeholder="Введите значение"
        size={size}
      />
    );
  }
  if (row === "long-label") {
    return <Input defaultValue="Значение" label="Очень длинная внутренняя подпись поля без переноса" labelView="inner" size={size} />;
  }
  if (row === "long-placeholder") {
    return <Input label="Описание" labelView="inner" placeholder="Очень длинный placeholder, который обязан обрезаться" size={size} />;
  }
  if (row === "leading") {
    return <Input defaultValue="Запрос" label="Поиск" labelView="inner" size={size} startAdornment={<Search />} />;
  }
  if (row === "end") {
    return <PasswordInput defaultValue="password" label="Пароль" labelView="inner" size={size} />;
  }
  if (row === "error") {
    return <Input defaultValue="Значение" error="Ошибка" label="Название" labelView="inner" size={size} />;
  }
  if (row === "disabled") {
    return <Input defaultValue="Значение" disabled label="Название" labelView="inner" size={size} />;
  }
  if (row === "read-only") {
    return <Input defaultValue="Значение" label="Название" labelView="inner" readOnly size={size} />;
  }
  if (row === "loading") {
    return (
      <Select
        block
        collectionState={{ status: "loading" }}
        items={[]}
        label="Загрузка"
        labelView="inner"
        onChange={() => undefined}
        size={size}
        value={null}
      />
    );
  }
  if (row === "select-value") {
    return <Select block items={options} label="Категория" labelView="inner" onChange={() => undefined} size={size} value="alpha" />;
  }
  if (row === "multi-value") {
    return <MultiSelect block items={options} label="Метки" labelView="inner" onChange={() => undefined} size={size} value={["alpha", "beta"]} />;
  }
  return (
    <Input
      label="Название"
      labelView="inner"
      placeholder="Введите значение"
      size={size}
      {...(row === "value" ? { defaultValue: "Значение" } : {})}
    />
  );
}

function CalibrationGrid() {
  return (
    <div className={styles.grid}>
      {(["sm", "md", "lg"] as const).flatMap((size) => [
        <Input key={`${size}-empty`} label={`Input ${size}`} labelView="inner" placeholder="Введите значение" size={size} />,
        <Input defaultValue="Значение" key={`${size}-value`} label={`Input ${size} value`} labelView="inner" size={size} startAdornment={<Search />} />,
        <Select block items={options} key={`${size}-select`} label={`Select ${size}`} labelView="inner" onChange={() => undefined} size={size} value="alpha" />,
        <MultiSelect block items={options} key={`${size}-multi`} label={`MultiSelect ${size}`} labelView="inner" onChange={() => undefined} size={size} value={["alpha", "beta"]} />
      ])}
    </div>
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

export const OpticalFreezeMatrix: Story = {
  args: {} as never,
  render: () => (
    <div className={styles.canvas}>
      <div className={styles.matrixScroller}>
        <div className={styles.matrix}>
          <span className={styles.matrixHeader}>State</span>
          {(["sm", "md", "lg"] as const).map((size) => (
            <span className={styles.matrixHeader} key={size}>{size.toUpperCase()}</span>
          ))}
          {matrixRows.flatMap((row) => [
            <span className={styles.matrixLabel} key={`${row}-label`}>{matrixLabels[row]}</span>,
            ...(["sm", "md", "lg"] as const).map((size) => (
              <MatrixField key={`${row}-${size}`} row={row} size={size} />
            ))
          ])}
        </div>
      </div>
    </div>
  )
};

export const CalibrationMobile390x844: Story = {
  args: {} as never,
  render: () => <div className={styles.viewport390}><CalibrationGrid /></div>
};

export const CalibrationTablet768x1024: Story = {
  args: {} as never,
  render: () => <div className={styles.viewport768}><CalibrationGrid /></div>
};

export const CalibrationDesktop1440x900: Story = {
  args: {} as never,
  render: () => <div className={styles.viewport1440}><CalibrationGrid /></div>
};
