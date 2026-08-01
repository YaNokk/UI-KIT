import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesignSystemProvider } from "../../DesignSystemProvider/DesignSystemProvider";
import { Checkbox } from "../../Checkbox/Checkbox";
import { Radio } from "../../Radio/Radio";
import { Switch } from "../../Switch/Switch";
import { ChoiceIndicator } from "./ChoiceControl";

const meta = {
  title: "Foundations/ChoiceControls",
  parameters: {
    docs: {
      description: {
        component: "Private indicator, typography and state calibration for the native choice-control family."
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const ChoiceIndicators: Story = {
  render: () => (
    <div className="grid gap-4">
      {(["sm", "md"] as const).map((size) => (
        <div className="flex items-center gap-3" key={size}>
          <span className="typo-body-sm w-8">{size}</span>
          <ChoiceIndicator kind="checkbox" size={size} />
          <ChoiceIndicator checked kind="checkbox" size={size} />
          <ChoiceIndicator indeterminate kind="checkbox" size={size} />
          <ChoiceIndicator kind="radio" size={size} />
          <ChoiceIndicator checked kind="radio" size={size} />
          <ChoiceIndicator kind="switch" size={size} />
          <ChoiceIndicator checked kind="switch" size={size} />
        </div>
      ))}
    </div>
  )
};

export const ChoiceControlTypography: Story = {
  render: () => (
    <div className="grid max-w-md gap-4">
      <Checkbox label="Ag Дру gj 08 99+" size="sm" />
      <Checkbox label="Ag Дру gj 08 99+" size="md" />
      <Checkbox description="Кириллица, descenders и числа 08 99+" label="Ag Дру gj" />
    </div>
  )
};

export const ChoiceControlStates: Story = {
  render: () => (
    <div className="grid gap-4">
      <Checkbox label="Unchecked" />
      <Checkbox defaultChecked label="Checked" />
      <Checkbox indeterminate label="Indeterminate" />
      <Checkbox disabled label="Disabled" />
      <Checkbox error="Ошибка" label="Invalid" />
      <Radio defaultChecked label="Radio" />
      <Switch defaultChecked label="Switch" />
    </div>
  )
};

export const DarkAndBrand: Story = {
  render: () => (
    <div className="grid gap-4">
      <DesignSystemProvider mode="dark"><div className="grid gap-3 bg-background-surface p-4"><Checkbox defaultChecked label="Dark checkbox" /><Radio defaultChecked label="Dark radio" /><Switch defaultChecked label="Dark switch" /></div></DesignSystemProvider>
      {/* eslint-disable-next-line design-system/no-design-literals -- Runtime brand contrast stress case. */}
      <DesignSystemProvider brand={{ accentColor: "#facc15" }}><div className="grid gap-3 p-4"><Checkbox defaultChecked label="Light brand checkbox" /><Radio defaultChecked label="Light brand radio" /><Switch defaultChecked label="Light brand switch" /></div></DesignSystemProvider>
    </div>
  )
};
