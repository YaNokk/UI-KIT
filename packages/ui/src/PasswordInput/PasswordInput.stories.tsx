import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { PasswordInput } from "./PasswordInput";
import styles from "../Input/Input.stories.module.css";

const meta = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  args: {
    autoComplete: "current-password",
    label: "Пароль",
    placeholder: "Введите пароль"
  },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => <div className="w-80 max-w-full"><Story /></div>
  ]
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Visible: Story = { args: { visible: true, value: "secret" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "secret" } };
export const Error: Story = { args: { error: "Пароль обязателен", required: true } };
export const NewPasswordAutocomplete: Story = {
  args: { autoComplete: "new-password", label: "Новый пароль" }
};
export const InnerLabel: Story = {
  args: { labelView: "inner" }
};
export const InnerLabelInsetAlignment: Story = {
  parameters: {
    layout: "padded"
  },
  render: () => (
    <div className={styles.insetMatrix}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <section className={styles.insetGroup} key={size}>
          <div className={styles.insetGroupTitle}>Size {size}</div>
          {(["resting", "floating"] as const).map((state) => (
            <div className={styles.insetCase} key={state}>
              <span className={styles.insetCaseLabel}>Visibility toggle · {state}</span>
              <PasswordInput
                data-testid={`password-inset-${size}-${state}`}
                defaultValue={state === "floating" ? "secret" : undefined}
                label="Password label"
                labelView="inner"
                placeholder="Password placeholder"
                size={size}
              />
            </div>
          ))}
        </section>
      ))}
    </div>
  )
};
export const KeyboardToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Пароль");
    await userEvent.tab();
    await userEvent.tab();
    const toggle = canvas.getByRole("button", { name: "Показать пароль" });
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveAttribute("type", "text");
  }
};
export const InteractiveAdornmentIsolation: Story = {
  args: { labelView: "inner" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Пароль");
    const toggle = canvas.getByRole("button", { name: "Показать пароль" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveFocus();
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).not.toHaveFocus();
  }
};
export const ToggleHitArea: Story = {
  args: { labelView: "inner" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Пароль");
    const toggle = canvas.getByRole("button", { name: "Показать пароль" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveFocus();
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).not.toHaveFocus();
  }
};

export const CursorAreas: Story = {
  parameters: {
    layout: "padded"
  },
  render: () => (
    <div className={styles.insetMatrix}>
      <PasswordInput
        data-testid="password-cursor-input"
        label="Password label"
        labelView="inner"
        value="secret"
      />
      <PasswordInput
        data-testid="password-cursor-readonly"
        label="Read-only password"
        labelView="inner"
        readOnly
        value="secret"
      />
      <PasswordInput
        data-testid="password-cursor-disabled"
        disabled
        label="Disabled password"
        labelView="inner"
        value="secret"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId("password-cursor-input");
    const label = canvas.getByText("Password label", { selector: "label" });
    const shell = input.closest("[data-field-part=\"shell\"]");
    if (!(shell instanceof HTMLElement)) {
      throw new globalThis.Error("Password FieldShell was not rendered.");
    }
    const toggle = within(shell).getByRole("button", { name: "Показать пароль" });
    const readOnly = canvas.getByTestId("password-cursor-readonly");
    const disabled = canvas.getByTestId("password-cursor-disabled");

    await expect(getComputedStyle(input).cursor).toBe("text");
    await expect(getComputedStyle(label).cursor).toBe("text");
    await expect(getComputedStyle(toggle).cursor).toBe("pointer");
    await expect(getComputedStyle(readOnly).cursor).toBe("text");
    await expect(getComputedStyle(disabled).cursor).toBe("not-allowed");
  }
};
