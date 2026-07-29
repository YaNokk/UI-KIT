import { useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import {
  NumberInput,
  type NumberInputActions,
} from "./NumberInput";

const meta = {
  title: "Components/NumberInput",
  component: NumberInput,
  args: {
    id: "number-input",
    label: "Количество",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Locale-aware numeric field with a semantic `number | null` value, "
          + "decimal-safe ArrowUp/ArrowDown stepping, and Input/FormControl semantics.",
      },
    },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledExample(props: React.ComponentProps<typeof NumberInput>) {
  const [value, setValue] = useState<number | null>(props.value ?? null);
  return <NumberInput {...props} onChange={setValue} value={value} />;
}

export const Default: Story = {
  args: {
    locale: "ru-RU",
  },
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton", { name: "Количество" });
    await userEvent.type(input, "12,5");
    await expect(input).toHaveValue("12,5");
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("13,5");
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NumberInput
          {...args}
          id={`number-${size}`}
          key={size}
          size={size}
          value={1234.5}
        />
      ))}
    </div>
  ),
};

export const Integer: Story = {
  args: {
    maximumFractionDigits: 0,
    value: 12,
  },
};

export const Decimal: Story = {
  args: {
    maximumFractionDigits: 3,
    minimumFractionDigits: 2,
    value: 12.5,
  },
};

export const MinimumFractionCommit: Story = {
  args: {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    value: null,
  },
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
      <ControlledExample {...args} />
      <Button size="sm" variant="secondary">
        Commit focus target
      </Button>
    </div>
  ),
};

export const Negative: Story = {
  args: {
    allowNegative: true,
    value: -12.5,
  },
};

export const MinMax: Story = {
  args: {
    hint: "Редактирование может временно выйти за границы; blur фиксирует 1…10.",
    max: 10,
    min: 1,
    value: 5,
  },
};

export const Step: Story = {
  args: {
    hint: "Используйте ArrowUp и ArrowDown.",
    maximumFractionDigits: 2,
    step: 0.25,
    value: 1.25,
  },
};

function StepParityExample() {
  const [value, setValue] = useState<number | null>(0.2);
  const actionsRef = useRef<NumberInputActions | null>(null);

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
      <NumberInput
        actionsRef={actionsRef}
        aria-label="Проверка шага"
        label="Клавиатура и типизированные действия"
        maximumFractionDigits={2}
        onChange={setValue}
        step={0.1}
        value={value}
      />
      <div style={{ display: "flex", gap: "var(--ds-space-2)" }}>
        <Button
          onClick={() => actionsRef.current?.decrement()}
          size="sm"
          variant="secondary"
        >
          Decrement
        </Button>
        <Button
          onClick={() => actionsRef.current?.increment()}
          size="sm"
          variant="secondary"
        >
          Increment
        </Button>
      </div>
    </div>
  );
}

export const Actions: Story = {
  render: () => <StepParityExample />,
};

export const LargeValueBoundary: Story = {
  args: {
    hint:
      "Значение отображается, но небезопасный integer-scaled шаг выполняется как no-op.",
    maximumFractionDigits: 3,
    value: Number.MAX_SAFE_INTEGER,
  },
};

export const Locale: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <NumberInput label="ru-RU" locale="ru-RU" value={1234.5} />
      <NumberInput label="kk-KZ" locale="kk-KZ" value={1234.5} />
      <NumberInput label="en-US" locale="en-US" value={1234.5} />
    </div>
  ),
};

export const EmptyZero: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <NumberInput label="Пусто — null" value={null} />
      <NumberInput label="Ноль — 0" value={0} />
    </div>
  ),
};

export const ReadOnlyDisabled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <NumberInput label="Только чтение" readOnly value={12} />
      <NumberInput disabled label="Отключено" value={12} />
    </div>
  ),
};

export const Controlled: Story = {
  args: {
    locale: "ru-RU",
    value: 1234.5,
  },
  render: (args) => <ControlledExample {...args} />,
};
