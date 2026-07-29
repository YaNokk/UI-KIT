import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuantityInput } from "./QuantityInput";
import styles from "./QuantityInput.stories.module.css";

const labels = {
  "aria-label": "Количество товара",
  decreaseLabel: "Уменьшить количество",
  increaseLabel: "Увеличить количество",
};

const meta = {
  title: "Retail/QuantityInput",
  component: QuantityInput,
  args: {
    ...labels,
    defaultValue: 2,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Compact retail quantity control composed from sibling IconButton, "
          + "NumberInput, and IconButton primitives.",
      },
    },
  },
} satisfies Meta<typeof QuantityInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledExample(
  props: React.ComponentProps<typeof QuantityInput>,
) {
  const [value, setValue] = useState<number | null>(props.value ?? 2);
  return <QuantityInput {...props} onChange={setValue} value={value} />;
}

export const Default: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const increase = canvas.getByRole("button", {
      name: "Увеличить количество",
    });
    await userEvent.click(increase);
    await expect(canvas.getByRole("spinbutton")).toHaveValue("3");
    await expect(increase).toHaveFocus();
  },
};

export const MinBoundary: Story = {
  args: {
    min: 1,
    value: 1,
  },
};

export const MaxBoundary: Story = {
  args: {
    max: 5,
    value: 5,
  },
};

export const FractionalStep: Story = {
  args: {
    maximumFractionDigits: 2,
    min: 0,
    step: 0.25,
    value: 1.25,
  },
};

export const KeyboardButtonParity: Story = {
  args: {
    maximumFractionDigits: 2,
    min: 0,
    step: 0.1,
    value: 0.2,
  },
  render: (args) => <ControlledExample {...args} />,
};

export const StepAvailability: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <QuantityInput
        {...labels}
        aria-label="Небезопасный шаг"
        maximumFractionDigits={1}
        step={0.1}
        value={Number.MAX_SAFE_INTEGER / 10}
      />
      <QuantityInput
        {...labels}
        aria-label="Максимальная граница"
        max={5}
        value={5}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unsafeGroup = canvas.getByRole("group", {
      name: "Небезопасный шаг",
    });
    const boundaryGroup = canvas.getByRole("group", {
      name: "Максимальная граница",
    });

    await expect(
      within(unsafeGroup).getByRole("button", {
        name: "Увеличить количество",
      }),
    ).toBeDisabled();
    await expect(
      within(unsafeGroup).getByRole("button", {
        name: "Уменьшить количество",
      }),
    ).toBeEnabled();
    await expect(
      within(boundaryGroup).getByRole("button", {
        name: "Увеличить количество",
      }),
    ).toBeDisabled();
  },
};

export const Controlled: Story = {
  args: {
    max: 10,
    min: 1,
    value: 2,
  },
  render: (args) => <ControlledExample {...args} />,
};

export const EmptyBlur: Story = {
  args: {
    defaultValue: 2,
    min: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Clear the field and move focus away: the retail policy restores min.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 2,
  },
};

export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className={styles.narrow}>
        <Story />
      </div>
    ),
  ],
};

export const ProductExample: Story = {
  render: () => (
    <div className={styles.product}>
      <div className={styles.productCopy}>
        <span className={styles.productName}>Молоко 3,2%</span>
        <span className={styles.productMeta}>1 л · в наличии</span>
      </div>
      <ControlledExample {...labels} min={1} value={2} />
    </div>
  ),
};
