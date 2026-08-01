import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "../../Checkbox/Checkbox";
import { CheckboxGroup } from "../../CheckboxGroup/CheckboxGroup";
import { DesignSystemProvider } from "../../DesignSystemProvider/DesignSystemProvider";
import { RadioGroup } from "../../RadioGroup/RadioGroup";
import { Switch } from "../../Switch/Switch";

const radioOptions = [
  { label: "Ежедневно", value: "daily" },
  { disabled: true, label: "Еженедельно", value: "weekly" },
  { label: "Ежемесячно", value: "monthly" }
] as const;

const checkboxOptions = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" }
] as const;

function indicatorFor(control: HTMLElement): HTMLElement {
  const indicator = control.nextElementSibling;
  if (!(indicator instanceof HTMLElement)) throw new Error("Choice indicator was not rendered.");
  return indicator;
}

const meta = {
  title: "Foundations/ChoiceControlBrowserRegression",
  tags: ["test"],
  parameters: { layout: "centered" }
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const NativeInteraction: Story = {
  render: () => (
    <div className="grid gap-5">
      <Checkbox indeterminate label="Выбрать всё" />
      <Checkbox disabled label="Недоступный checkbox" />
      <RadioGroup defaultValue="daily" label="Частота" name="browser-frequency" options={radioOptions} />
      <Switch label="Push-уведомления" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole<HTMLInputElement>("checkbox", { name: "Выбрать всё" });
    expect(checkbox.indeterminate).toBe(true);
    await userEvent.tab();
    expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(checkbox).toBeChecked();
    await userEvent.click(canvas.getByText("Выбрать всё"));
    expect(checkbox).not.toBeChecked();

    await userEvent.tab();
    const daily = canvas.getByRole("radio", { name: "Ежедневно" });
    expect(daily).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const monthly = canvas.getByRole("radio", { name: "Ежемесячно" });
    expect(monthly).toBeChecked();
    expect(monthly).toHaveFocus();

    await userEvent.tab();
    const toggle = canvas.getByRole("switch", { name: "Push-уведомления" });
    expect(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(toggle).toBeChecked();
    expect(toggle).toHaveAttribute("role", "switch");
  }
};

export const GroupsAndForms: Story = {
  render: () => (
    <form data-testid="form">
      <div className="grid gap-5">
        <CheckboxGroup
          defaultValue={["email"]}
          description="Можно выбрать несколько"
          label="Каналы"
          name="channels"
          options={checkboxOptions}
          required
        />
        <RadioGroup
          defaultValue="monthly"
          error="Проверьте частоту"
          label="Частота"
          name="frequency"
          options={radioOptions}
          required
        />
      </div>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByTestId("form") as HTMLFormElement;
    const checkboxGroup = canvas.getByRole("group", { name: "Каналы" });
    const radioGroup = canvas.getByRole("group", { name: "Частота" });
    expect(checkboxGroup).toHaveAttribute("aria-required", "true");
    expect(radioGroup).toHaveAttribute("aria-invalid", "true");
    expect(checkboxGroup.getAttribute("aria-describedby")).toContain("description");
    expect(radioGroup.getAttribute("aria-describedby")).toContain("error");

    const formData = new FormData(form);
    expect(formData.getAll("channels")).toEqual(["email"]);
    expect(formData.get("frequency")).toBe("monthly");
    for (const checkbox of canvas.getAllByRole("checkbox")) expect(checkbox).not.toBeRequired();
    expect(canvas.getByRole("radio", { name: "Ежедневно" })).toBeRequired();
  }
};

export const GeometryThemeAndMedia: Story = {
  render: () => (
    <div className="grid gap-5">
      <div className="flex items-center gap-3">
        <Checkbox defaultChecked label="Checkbox sm" size="sm" />
        <Checkbox defaultChecked label="Checkbox md" size="md" />
        <Switch defaultChecked label="Switch sm" size="sm" />
        <Switch defaultChecked label="Switch md" size="md" />
      </div>
      <DesignSystemProvider mode="dark">
        <div className="flex items-center gap-3 bg-background-surface p-4">
          <Checkbox defaultChecked label="Dark checkbox" />
          <RadioGroup defaultValue="daily" label="Dark radio" options={radioOptions} />
          <Switch defaultChecked label="Dark switch" />
        </div>
      </DesignSystemProvider>
      {/* eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case. */}
      <DesignSystemProvider brand={{ accentColor: "#facc15" }}>
        <div className="flex items-center gap-3 p-4"><Checkbox defaultChecked label="Bright brand" /></div>
      </DesignSystemProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expected = new Map([
      ["Checkbox sm", [20, 20]],
      ["Checkbox md", [24, 24]],
      ["Switch sm", [32, 20]],
      ["Switch md", [40, 24]]
    ]);
    for (const [name, [width, height]] of expected) {
      const role = name.startsWith("Switch") ? "switch" : "checkbox";
      const control = canvas.getByRole(role, { name });
      const rect = indicatorFor(control).getBoundingClientRect();
      expect(Math.round(rect.width)).toBe(width);
      expect(Math.round(rect.height)).toBe(height);
    }

    const checked = canvas.getByRole("checkbox", { name: "Checkbox md" });
    checked.focus();
    const indicator = indicatorFor(checked);
    expect(getComputedStyle(indicator).outlineStyle).toBe("solid");
    expect(getComputedStyle(indicator).borderStyle).toBe("solid");

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    expect(getComputedStyle(indicator).transitionDuration)
      .toBe(reducedMotion ? "0s" : "0.12s, 0.12s, 0.12s");

    if (matchMedia("(forced-colors: active)").matches) {
      expect(getComputedStyle(indicator).forcedColorAdjust).toBe("none");
      expect(getComputedStyle(indicator).borderWidth).not.toBe("0px");
    }

    const darkIndicator = indicatorFor(canvas.getByRole("checkbox", { name: "Dark checkbox" }));
    const brandIndicator = indicatorFor(canvas.getByRole("checkbox", { name: "Bright brand" }));
    const darkRow = darkIndicator.closest("[data-ds-root]")?.firstElementChild;
    if (!(darkRow instanceof HTMLElement)) throw new Error("Dark theme fixture was not rendered.");
    expect(getComputedStyle(darkIndicator).backgroundColor)
      .not.toBe(getComputedStyle(darkRow).backgroundColor);
    expect(getComputedStyle(brandIndicator).color)
      .not.toBe(getComputedStyle(brandIndicator).backgroundColor);
  }
};
