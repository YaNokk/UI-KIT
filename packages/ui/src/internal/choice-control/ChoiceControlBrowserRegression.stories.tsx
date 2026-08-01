/* eslint-disable design-system/no-design-literals -- Deliberate runtime-brand contrast fixtures. */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../Button/Button";
import { Checkbox } from "../../Checkbox/Checkbox";
import { CheckboxGroup } from "../../CheckboxGroup/CheckboxGroup";
import { DesignSystemProvider } from "../../DesignSystemProvider/DesignSystemProvider";
import { Radio } from "../../Radio/Radio";
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

export const RadioDescriptionAssociation: Story = {
  render: () => (
    <div className="grid gap-5">
      <span id="radio-external-description">External radio context</span>
      <Radio
        aria-describedby="radio-external-description"
        description="Standalone description"
        id="standalone-radio"
        label="Standalone radio"
        name="standalone"
        value="standalone"
      />
      <RadioGroup
        error="Select a delivery frequency"
        label="Delivery frequency"
        options={[
          { description: "Delivered every day", label: "Daily delivery", value: "daily" },
          { description: "Delivered every week", label: "Weekly delivery", value: "weekly" }
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const standalone = canvas.getByRole("radio", { name: "Standalone radio" });
    expect(standalone).toHaveAttribute(
      "aria-describedby",
      "radio-external-description standalone-radio-description"
    );

    const group = canvas.getByRole("group", { name: "Delivery frequency" });
    const daily = canvas.getByRole("radio", { name: "Daily delivery" });
    const weekly = canvas.getByRole("radio", { name: "Weekly delivery" });
    expect(group.getAttribute("aria-describedby")).toContain("error");
    expect(daily.getAttribute("aria-describedby")).toContain("description");
    expect(weekly.getAttribute("aria-describedby")).toContain("description");
    expect(daily.getAttribute("aria-describedby")).not.toBe(
      weekly.getAttribute("aria-describedby")
    );
    expect(daily.getAttribute("aria-describedby")).not.toContain("error");
    expect(weekly.getAttribute("aria-describedby")).not.toContain("error");
  }
};

const switchBrands = [
  { name: "default-blue" },
  { brand: { accentColor: "#facc15" }, name: "bright-yellow" },
  { brand: { accentColor: "#86efac" }, name: "light-green" },
  { brand: { accentColor: "#003366" }, name: "dark-brand" }
] as const;

export const SwitchBrandForeground: Story = {
  render: () => (
    <div className="grid gap-3">
      {switchBrands.map((fixture) => (
        <DesignSystemProvider
          {...("brand" in fixture ? { brand: fixture.brand } : {})}
          data-switch-brand={fixture.name}
          key={fixture.name}
        >
          <div className="flex items-center gap-3 p-2">
            <Switch defaultChecked label={`${fixture.name} switch`} />
            <Button variant="primary">{`${fixture.name} primary`}</Button>
          </div>
        </DesignSystemProvider>
      ))}
      <div>
        <span
          data-disabled-thumb-probe=""
          style={{ backgroundColor: "var(--ds-icon-disabled)" }}
        />
        <Switch defaultChecked disabled label="disabled checked switch" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const forcedColors = matchMedia("(forced-colors: active)").matches;

    for (const fixture of switchBrands) {
      const scope = canvasElement.querySelector(`[data-switch-brand="${fixture.name}"]`);
      if (!(scope instanceof HTMLElement)) throw new Error(`Missing ${fixture.name}`);
      const control = within(scope).getByRole("switch", { name: `${fixture.name} switch` });
      const button = within(scope).getByRole("button", { name: `${fixture.name} primary` });
      const indicator = indicatorFor(control);
      const thumb = indicator.firstElementChild;
      if (!(thumb instanceof HTMLElement)) throw new Error(`Missing ${fixture.name} thumb`);

      if (!forcedColors) {
        expect(getComputedStyle(indicator).backgroundColor)
          .toBe(getComputedStyle(button).backgroundColor);
        expect(getComputedStyle(thumb).backgroundColor)
          .toBe(getComputedStyle(button).color);
      }
    }

    const disabled = canvas.getByRole("switch", { name: "disabled checked switch" });
    const disabledIndicator = indicatorFor(disabled);
    const disabledThumb = disabledIndicator.firstElementChild;
    const disabledProbe = canvasElement.querySelector("[data-disabled-thumb-probe]");
    if (!(disabledThumb instanceof HTMLElement)) throw new Error("Missing disabled thumb");
    if (!(disabledProbe instanceof HTMLElement)) throw new Error("Missing disabled probe");
    expect(getComputedStyle(disabledThumb).backgroundColor).toBe(
      forcedColors
        ? getComputedStyle(disabledIndicator).color
        : getComputedStyle(disabledProbe).backgroundColor
    );
  }
};

export const GroupInvalidOwnership: Story = {
  render: () => (
    <div className="grid gap-5">
      <CheckboxGroup error="Select a channel" label="Invalid channels" options={checkboxOptions} />
      <RadioGroup error="Select a frequency" label="Invalid frequency" options={radioOptions} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ["Invalid channels", "Invalid frequency"]) {
      expect(canvas.getByRole("group", { name })).toHaveAttribute("aria-invalid", "true");
    }
    for (const control of [
      ...canvas.getAllByRole("checkbox"),
      ...canvas.getAllByRole("radio")
    ]) {
      expect(control).not.toHaveAttribute("aria-invalid");
      expect(indicatorFor(control)).not.toHaveAttribute("data-invalid");
    }
  }
};

export const StandaloneFormSubmission: Story = {
  render: () => (
    <form data-testid="standalone-form">
      <Checkbox defaultChecked label="Checked checkbox" name="checkbox-named" value="yes" />
      <Checkbox label="Unchecked checkbox" name="checkbox-off" value="yes" />
      <Checkbox defaultChecked label="Default checkbox value" name="checkbox-default" />
      <Switch defaultChecked label="On switch" name="switch-named" value="enabled" />
      <Switch label="Off switch" name="switch-off" value="enabled" />
      <Switch defaultChecked label="Default switch value" name="switch-default" />
      <Radio label="First radio" name="native-radio" value="first" />
      <Radio defaultChecked label="Second radio" name="native-radio" value="second" />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const form = within(canvasElement).getByTestId("standalone-form") as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("checkbox-named")).toBe("yes");
    expect(data.has("checkbox-off")).toBe(false);
    expect(data.get("checkbox-default")).toBe("on");
    expect(data.get("switch-named")).toBe("enabled");
    expect(data.has("switch-off")).toBe(false);
    expect(data.get("switch-default")).toBe("on");
    expect(data.getAll("native-radio")).toEqual(["second"]);
  }
};

export const UncontrolledIndicatorStates: Story = {
  render: () => (
    <div className="grid gap-4">
      <Checkbox label="Uncontrolled checkbox" />
      <div>
        <Radio label="Uncontrolled radio A" name="uncontrolled-radio" value="a" />
        <Radio label="Uncontrolled radio B" name="uncontrolled-radio" value="b" />
      </div>
      <Switch label="Uncontrolled switch" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Uncontrolled checkbox" });
    const checkboxMark = indicatorFor(checkbox).firstElementChild;
    if (!(checkboxMark instanceof Element)) throw new Error("Missing checkbox mark");
    expect(getComputedStyle(checkboxMark).display).toBe("none");
    await userEvent.click(checkbox);
    expect(getComputedStyle(checkboxMark).display).toBe("block");

    const radio = canvas.getByRole("radio", { name: "Uncontrolled radio B" });
    const radioDot = indicatorFor(radio).firstElementChild;
    if (!(radioDot instanceof HTMLElement)) throw new Error("Missing radio dot");
    const radioTransformBefore = getComputedStyle(radioDot).transform;
    await userEvent.click(radio);
    await waitFor(() => {
      expect(getComputedStyle(radioDot).transform).not.toBe(radioTransformBefore);
    });

    const toggle = canvas.getByRole("switch", { name: "Uncontrolled switch" });
    const switchThumb = indicatorFor(toggle).firstElementChild;
    if (!(switchThumb instanceof HTMLElement)) throw new Error("Missing switch thumb");
    const switchTransformBefore = getComputedStyle(switchThumb).transform;
    await userEvent.click(toggle);
    await waitFor(() => {
      expect(getComputedStyle(switchThumb).transform).not.toBe(switchTransformBefore);
    });
  }
};

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
    expect(checkboxGroup).toHaveAttribute("data-required");
    expect(checkboxGroup).not.toHaveAttribute("aria-required");
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
