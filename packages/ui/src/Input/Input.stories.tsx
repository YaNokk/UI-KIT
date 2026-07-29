import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mail, Search } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "./Input";

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
export const ClickShellFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Название" });
    const shell = input.closest("[data-label-view]");
    if (!shell) throw new globalThis.Error("FieldShell was not rendered.");
    await userEvent.click(shell);
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
