import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { expect, within } from "storybook/test";
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

function FocusedInput({ size }: { size: FieldSize }) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <Input
      label={`Focused ${size}`}
      labelView="inner"
      placeholder="Длинный placeholder для focused-состояния"
      ref={ref}
      size={size}
    />
  );
}

function OpenSelect({ size }: { size: FieldSize }) {
  return (
    <Select
      block
      items={options}
      label={`Open Select ${size}`}
      labelView="inner"
      onChange={() => undefined}
      open
      placeholder="Длинный placeholder открытого Select"
      size={size}
      value={null}
    />
  );
}

function OpenMultiSelect({ size }: { size: FieldSize }) {
  return (
    <MultiSelect
      block
      items={options}
      label={`Open MultiSelect ${size}`}
      labelView="inner"
      onChange={() => undefined}
      open
      placeholder="Выберите несколько вариантов"
      size={size}
      value={[]}
    />
  );
}

function GeometryAssertionsFixture() {
  return (
    <div className={styles.grid}>
      <Input defaultValue="Значение" label="Geometry Input sm" labelView="inner" size="sm" />
      <Select block items={options} label="Geometry Select md" labelView="inner" onChange={() => undefined} size="md" value="alpha" />
      <MultiSelect block items={options} label="Geometry MultiSelect lg" labelView="inner" onChange={() => undefined} size="lg" value={["alpha", "beta"]} />
    </div>
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
  title: "Fields/FieldShell/InnerLabelGeometryV1_6",
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

export const OpticalContainer390: Story = {
  args: {} as never,
  render: () => <div className={styles.viewport390}><CalibrationGrid /></div>
};

export const OpticalContainer768: Story = {
  args: {} as never,
  render: () => <div className={styles.viewport768}><CalibrationGrid /></div>
};

export const OpticalContainer1440: Story = {
  args: {} as never,
  render: () => <div className={styles.viewport1440}><CalibrationGrid /></div>
};

export const ResponsiveViewportMobile: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <CalibrationGrid />
};

export const ResponsiveViewportTablet: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "tablet" } },
  render: () => <CalibrationGrid />
};

export const ResponsiveViewportDesktop: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <CalibrationGrid />
};

export const FocusedSm: Story = {
  args: {} as never,
  render: () => <FocusedInput size="sm" />
};

export const FocusedMd: Story = {
  args: {} as never,
  render: () => <FocusedInput size="md" />
};

export const FocusedLg: Story = {
  args: {} as never,
  render: () => <FocusedInput size="lg" />
};

export const OpenEmptySelectSm: Story = {
  args: {} as never,
  render: () => <OpenSelect size="sm" />
};

export const OpenEmptySelectMd: Story = {
  args: {} as never,
  render: () => <OpenSelect size="md" />
};

export const OpenEmptySelectLg: Story = {
  args: {} as never,
  render: () => <OpenSelect size="lg" />
};

export const OpenEmptyMultiSelectSm: Story = {
  args: {} as never,
  render: () => <OpenMultiSelect size="sm" />
};

export const OpenEmptyMultiSelectMd: Story = {
  args: {} as never,
  render: () => <OpenMultiSelect size="md" />
};

export const OpenEmptyMultiSelectLg: Story = {
  args: {} as never,
  render: () => <OpenMultiSelect size="lg" />
};

export const GeometryAssertions: Story = {
  args: {} as never,
  tags: ["test"],
  render: () => <GeometryAssertionsFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const assertBands = (
      control: HTMLElement,
      value: HTMLElement,
      tolerance: number
    ) => {
      const shell = control.closest<HTMLElement>("[data-field-part=\"shell\"]");
      const label = shell?.querySelector<HTMLElement>("[data-field-part=\"inner-label\"]");
      if (!shell || !label) throw new Error("Inner field geometry was not rendered.");
      const labelRect = label.getBoundingClientRect();
      const valueRect = value.getBoundingClientRect();
      expect(labelRect.bottom).toBeLessThanOrEqual(valueRect.top + tolerance);
      const shellStyle = getComputedStyle(shell);
      expect(parseFloat(shellStyle.getPropertyValue("--field-content-padding-bottom")))
        .toBeGreaterThan(0);
      const labelStyle = getComputedStyle(label);
      expect(labelStyle.transitionProperty.split(",").map((entry) => entry.trim()))
        .toEqual(["color", "transform"]);
      expect(labelStyle.transitionProperty).not.toContain("font");
      expect(labelStyle.transitionProperty).not.toContain("inset-block-start");
    };

    const input = canvas.getByRole("textbox", { name: "Geometry Input sm" });
    assertBands(input, input, 4.5);
    expect(input.closest("[data-field-part=\"shell\"]")?.getBoundingClientRect().height).toBe(32);

    const select = canvas.getByRole("button", { name: "Geometry Select md" });
    assertBands(select, select, 0.5);
    expect(select.closest("[data-field-part=\"shell\"]")?.getBoundingClientRect().height).toBe(40);

    const multi = canvas.getByRole("button", { name: "Geometry MultiSelect lg" });
    const chip = multi.closest("[data-field-part=\"shell\"]")
      ?.querySelector<HTMLElement>("[data-field-chip]");
    if (!chip) throw new Error("MultiSelect chip was not rendered.");
    assertBands(multi, chip, 0.5);
    expect(multi.closest("[data-field-part=\"shell\"]")?.getBoundingClientRect().height).toBe(48);
  }
};
