import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mail, Search, X } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { IconButton } from "../IconButton/IconButton";
import { PasswordInput } from "../PasswordInput/PasswordInput";
import { Input } from "./Input";
import styles from "./Input.stories.module.css";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    label: "Название",
    placeholder: "Введите значение",
    size: "md"
  },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => <div className="w-80 max-w-full"><Story /></div>
  ]
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Sizes: Story = {
  args: {
    labelView: "outer"
  },

  render: (args) => (
    <div className="grid gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Input {...args} key={size} label={`Размер ${size}`} size={size} />
      ))}
    </div>
  )
};
export const Hint: Story = {
  args: { hint: "Краткое пояснение назначения поля" }
};
export const Error: Story = {
  args: { error: "Введите корректное значение" }
};
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Недоступно" } };
export const ReadOnly: Story = { args: { readOnly: true, value: "Можно выделить и скопировать" } };
export const Adornments: Story = {
  args: {
    startAdornment: <Search aria-hidden="true" />,
    endAdornment: <span>RUB</span>
  }
};
export const DecorativeIcon: Story = {
  args: { startAdornment: <Mail aria-hidden="true" />, type: "email" }
};
export const LongValue: Story = {
  args: { defaultValue: "Очень длинное значение поля, которое продолжает работать как обычный native input" }
};
export const Uncontrolled: Story = { args: { defaultValue: "Начальное значение" } };
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("Управляемое значение");
    return (
      <Input
        {...args}
        onChange={(event) => setValue(event.currentTarget.value)}
        value={value}
      />
    );
  }
};
export const Autocomplete: Story = {
  args: {
    autoComplete: "email",
    hint: "Используется нативный browser autofill",
    label: "Email",
    name: "email",
    type: "email"
  }
};

export const OuterLabel: Story = {
  args: { labelView: "outer" }
};
export const InnerLabelEmpty: Story = {
  args: { labelView: "inner", placeholder: undefined }
};
export const InnerLabelFocused: Story = {
  args: { labelView: "inner" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Название" });
    await userEvent.click(input);
    await expect(input.closest("[data-label-floated]")).toBeInTheDocument();
  }
};
export const InnerLabelWithValue: Story = {
  args: { defaultValue: "Готовое значение", labelView: "inner" }
};
export const InnerLabelWithPlaceholder: Story = {
  args: { labelView: "inner", placeholder: "Введите название" }
};
export const InnerLabelRequired: Story = {
  args: { labelView: "inner", required: true }
};
export const InnerLabelInvalid: Story = {
  args: { error: "Исправьте значение", labelView: "inner" }
};
export const InnerLabelDisabled: Story = {
  args: { disabled: true, labelView: "inner" }
};
export const InnerLabelReadOnly: Story = {
  args: { labelView: "inner", readOnly: true, value: "Только чтение" }
};
export const InnerLabelStartAdornment: Story = {
  args: {
    labelView: "inner",
    startAdornment: <Search aria-hidden="true" />
  }
};
export const InnerLabelEndAdornment: Story = {
  args: { endAdornment: <span>RUB</span>, labelView: "inner" }
};

const insetCases = [
  { id: "none", label: "No adornments" },
  {
    id: "start",
    label: "Start adornment",
    startAdornment: <Search aria-hidden="true" />
  },
  {
    id: "end",
    label: "End adornment",
    endAdornment: <span>RUB</span>
  },
  {
    id: "both",
    label: "Both adornments",
    startAdornment: <Search aria-hidden="true" />,
    endAdornment: <span>RUB</span>
  }
] as const;

export const InnerLabelInsetAlignment: Story = {
  parameters: {
    layout: "padded"
  },
  render: () => (
    <div className={styles.insetMatrix}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <section className={styles.insetGroup} key={size}>
          <div className={styles.insetGroupTitle}>Size {size}</div>
          <div className={styles.insetCases}>
            {insetCases.flatMap((insetCase) =>
              (["resting", "floating"] as const).map((state) => (
                <div className={styles.insetCase} key={`${insetCase.id}-${state}`}>
                  <span className={styles.insetCaseLabel}>
                    {insetCase.label} · {state}
                  </span>
                  <Input
                    data-testid={`inset-${size}-${insetCase.id}-${state}`}
                    defaultValue={state === "floating" ? "Aligned value" : undefined}
                    endAdornment={"endAdornment" in insetCase ? insetCase.endAdornment : undefined}
                    label="Aligned label stays inside the available content area"
                    labelView="inner"
                    placeholder="Aligned placeholder"
                    size={size}
                    startAdornment={"startAdornment" in insetCase ? insetCase.startAdornment : undefined}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  )
};

export const FloatingLabelGeometry: Story = {
  parameters: {
    layout: "padded"
  },
  render: () => (
    <div className={styles.insetMatrix}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <section className={styles.insetGroup} key={size}>
          <div className={styles.insetGroupTitle}>Size {size}</div>
          <div className={styles.insetCases}>
            <Input
              data-testid={`geometry-${size}-resting`}
              label="Resting label"
              labelView="inner"
              placeholder="Placeholder baseline"
              size={size}
            />
            <Input
              data-testid={`geometry-${size}-value`}
              defaultValue="Stable value baseline"
              label="Floating label"
              labelView="inner"
              placeholder="Placeholder baseline"
              size={size}
            />
          </div>
        </section>
      ))}
      <Input
        defaultValue="A long native value remains selectable and aligned across the full input hit area"
        label="A long floating label truncates inside the available content area without vertical clipping"
        labelView="inner"
        size="md"
      />
      <Input
        defaultValue="Invalid value"
        error="Geometry remains stable in the invalid state"
        label="Invalid"
        labelView="inner"
        size="md"
      />
      <Input
        defaultValue="Disabled value"
        disabled
        label="Disabled"
        labelView="inner"
        size="md"
      />
      <Input
        label="Read only"
        labelView="inner"
        readOnly
        size="md"
        value="Read-only value"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const size of ["sm", "md", "lg"] as const) {
      const input = canvas.getByTestId(`geometry-${size}-resting`);
      await userEvent.click(input);
      await expect(input).toHaveFocus();
      await expect(input.closest("[data-label-floated]")).toBeInTheDocument();
    }
  }
};

export const FloatingLabelMdReference: Story = {
  parameters: {
    layout: "padded"
  },
  render: () => (
    <div className={styles.insetMatrix}>
      <Input
        data-testid="md-reference-focused"
        label="Focused empty"
        labelView="inner"
        placeholder="Placeholder baseline"
        size="md"
      />
      <Input
        defaultValue="Value"
        label="Start adornment"
        labelView="inner"
        size="md"
        startAdornment={<Search aria-hidden="true" />}
      />
      <Input
        defaultValue="Value"
        endAdornment={<span>RUB</span>}
        label="End adornment"
        labelView="inner"
        size="md"
      />
      <Input
        defaultValue="Value"
        endAdornment={<span>RUB</span>}
        label="Both adornments"
        labelView="inner"
        size="md"
        startAdornment={<Search aria-hidden="true" />}
      />
      <PasswordInput
        defaultValue="secret"
        label="PasswordInput parity"
        labelView="inner"
        size="md"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const focusedInput = within(canvasElement).getByTestId("md-reference-focused");
    await userEvent.click(focusedInput);
    await expect(focusedInput).toHaveFocus();
  }
};

export const InteractionAnatomy: Story = {
  args: {
    className: styles.interactionAnatomy,
    endAdornment: (
      <span data-field-interactive data-testid="anatomy-interactive">
        <IconButton
          aria-label="Independent action"
          icon={<X />}
          size="sm"
          variant="ghost"
        />
      </span>
    ),
    label: "Semantic inner label",
    labelView: "inner",
    placeholder: "Native input",
    startAdornment: (
      <span data-testid="anatomy-decorative">
        <Search aria-hidden="true" />
      </span>
    )
  },
  render: (args) => (
    <div>
      <Input {...args} />
      <div className={styles.legend}>
        <span>Solid outline — FieldShell boundary</span>
        <span>Dashed outline — full-size native input</span>
        <span>Selected surface — semantic label</span>
        <span>Subtle surface — decorative adornment forwarding zone</span>
        <span>Interactive action — independent button semantics</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Semantic inner label" });
    const label = canvas.getByText("Semantic inner label", { selector: "label" });
    const decorative = canvas.getByTestId("anatomy-decorative");
    const action = canvas.getByRole("button", { name: "Independent action" });

    await userEvent.click(label);
    await expect(input).toHaveFocus();
    input.blur();
    await userEvent.click(decorative);
    await expect(input).toHaveFocus();
    input.blur();
    await userEvent.click(action);
    await expect(action).toHaveFocus();
    await expect(input).not.toHaveFocus();
  }
};

export const CursorAreas: Story = {
  parameters: {
    layout: "padded"
  },
  render: () => (
    <div className={styles.insetMatrix}>
      <Input
        data-testid="cursor-editable"
        label="Resting inner label"
        labelView="inner"
        placeholder="Editable input"
      />
      <Input
        data-testid="cursor-decorative"
        label="Decorative adornment"
        labelView="inner"
        startAdornment={<Search aria-hidden="true" data-testid="cursor-icon" />}
      />
      <Input
        data-testid="cursor-readonly"
        label="Read-only label and value"
        labelView="inner"
        readOnly
        value="Selectable value"
      />
      <Input
        data-testid="cursor-disabled"
        disabled
        label="Disabled field"
        labelView="inner"
        value="Unavailable"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editable = canvas.getByTestId("cursor-editable");
    const editableLabel = canvas.getByText("Resting inner label", { selector: "label" });
    const decorative = canvas.getByTestId("cursor-icon").closest(
      "[data-field-part=\"start-adornment\"]"
    );
    const readOnly = canvas.getByTestId("cursor-readonly");
    const disabled = canvas.getByTestId("cursor-disabled");

    await expect(getComputedStyle(editable).cursor).toBe("text");
    await expect(getComputedStyle(editableLabel).cursor).toBe("text");
    if (!decorative) throw new globalThis.Error("Decorative adornment was not rendered.");
    await expect(getComputedStyle(decorative).cursor).toBe("text");
    await expect(getComputedStyle(readOnly).cursor).toBe("text");
    await expect(getComputedStyle(disabled).cursor).toBe("not-allowed");
  }
};

function HintErrorTransitionExample() {
  const [invalid, setInvalid] = useState(false);
  return (
    <div className="grid gap-3">
      <Input
        error={invalid ? "Значение не прошло проверку" : undefined}
        hint="Подсказка скрывается при ошибке"
        label="Проверяемое поле"
      />
      <button onClick={() => setInvalid((value) => !value)} type="button">
        Переключить состояние
      </button>
    </div>
  );
}

export const HintToErrorTransition: Story = {
  render: () => <HintErrorTransitionExample />
};
export const LongHint: Story = {
  args: {
    hint: "Длинная подсказка переносится под полем и остаётся связанной с контролом через aria-describedby."
  }
};
export const LongError: Story = {
  args: {
    error: "Длинное сообщение об ошибке переносится под полем, заменяет подсказку и не меняет геометрию FieldShell."
  }
};
export const NativeContentFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Название" });
    await userEvent.click(input);
    await expect(input).toHaveFocus();
  }
};
export const ClickDecorativeAdornmentFocus: Story = {
  args: {
    startAdornment: <span data-testid="decorative-search"><Search aria-hidden="true" /></span>
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("decorative-search"));
    await expect(canvas.getByRole("textbox", { name: "Название" })).toHaveFocus();
  }
};
export const InteractiveAdornmentIsolation: Story = {
  args: {
    endAdornment: (
      <span data-field-interactive>
        <button type="button">Действие</button>
      </span>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole("button", { name: "Действие" });
    await userEvent.click(action);
    await expect(action).toHaveFocus();
    await expect(canvas.getByRole("textbox", { name: "Название" })).not.toHaveFocus();
  }
};

export const HitAreas: Story = {
  args: {
    className: styles.hitAreas,
    endAdornment: <span>%</span>,
    labelView: "inner",
    startAdornment: <Search aria-hidden="true" />
  },
  render: (args) => (
    <div>
      <Input {...args} />
      <div className={styles.legend}>
        <span>Solid outline — FieldShell</span>
        <span>Accent inset — full-height content</span>
        <span>Dashed outline — native input hit area</span>
        <span>Subtle columns — adornments</span>
        <span>Selected surface — positioned inner label</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Название" });
    const content = canvasElement.querySelector<HTMLElement>(
      "[data-field-part=\"content\"]"
    );
    if (!content) throw new globalThis.Error("Field content was not rendered.");

    const inputRect = input.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    await expect(Math.abs(inputRect.width - contentRect.width)).toBeLessThan(1);
    await expect(Math.abs(inputRect.height - contentRect.height)).toBeLessThan(1);

    const points = [
      { x: inputRect.right - 2, y: inputRect.top + 2 },
      { x: inputRect.right - 2, y: inputRect.bottom - 2 },
      { x: inputRect.left + 2, y: inputRect.top + inputRect.height / 2 }
    ];

    for (const point of points) {
      const hitTarget = document.elementFromPoint(point.x, point.y);
      if (!(hitTarget instanceof HTMLElement)) {
        throw new globalThis.Error("Hit-area target was not found.");
      }
      await userEvent.pointer({
        target: hitTarget,
        coords: { clientX: point.x, clientY: point.y },
        keys: "[MouseLeft]"
      });
      await expect(input).toHaveFocus();
      input.blur();
    }
  }
};
