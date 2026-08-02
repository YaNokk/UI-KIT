/* eslint-disable design-system/no-design-literals -- Deliberate visual calibration fixtures and runtime-brand stress cases. */
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "../../Checkbox/Checkbox";
import { CheckboxGroup } from "../../CheckboxGroup/CheckboxGroup";
import { DesignSystemProvider } from "../../DesignSystemProvider/DesignSystemProvider";
import { Radio } from "../../Radio/Radio";
import { RadioGroup } from "../../RadioGroup/RadioGroup";
import { Switch } from "../../Switch/Switch";

const radioOptions = [
  { description: "Отчёт будет приходить каждый день", label: "Ежедневно", value: "daily" },
  { label: "Еженедельно", value: "weekly" },
  { disabled: true, label: "Недоступный вариант", value: "disabled" }
] as const;

const checkboxOptions = [
  { description: "Основной канал для уведомлений", label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { disabled: true, label: "Недоступный канал", value: "disabled" }
] as const;

const brands = [
  { name: "Default blue" },
  { brand: { accentColor: "#facc15" }, name: "Bright yellow" },
  { brand: { accentColor: "#86efac" }, name: "Light green" },
  { brand: { accentColor: "#003366" }, name: "Dark navy" },
  { brand: { accentColor: "#7c3aed" }, name: "Purple" }
] as const;

function CalibrationSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="grid min-w-0 gap-3 rounded-lg border border-border-default bg-background-surface p-4">
      <h2 className="typo-heading-sm text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

function CalibrationPage({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 gap-4 bg-background-page p-6 text-text-primary">{children}</div>;
}

function indicatorFor(control: HTMLElement): HTMLElement {
  const indicator = control.nextElementSibling;
  if (!(indicator instanceof HTMLElement)) throw new Error("Choice indicator was not rendered.");
  return indicator;
}

function expectRect(element: HTMLElement, width: number, height: number) {
  const rect = element.getBoundingClientRect();
  expect(Math.round(rect.width)).toBe(width);
  expect(Math.round(rect.height)).toBe(height);
}

function expectThumbInset(track: HTMLElement, thumb: HTMLElement, edge: "start" | "end") {
  const trackRect = track.getBoundingClientRect();
  const thumbRect = thumb.getBoundingClientRect();
  const inset = edge === "start"
    ? thumbRect.left - trackRect.left
    : trackRect.right - thumbRect.right;
  expect(Math.round(inset)).toBe(2);
  expect(thumbRect.top).toBeGreaterThanOrEqual(trackRect.top);
  expect(thumbRect.bottom).toBeLessThanOrEqual(trackRect.bottom);
}

const meta = {
  title: "Foundations/ChoiceControlsVisualCalibration",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Visual approval matrix for frozen Choice Control geometry and semantic state mapping."
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const CheckboxGeometry: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Checkbox geometry">
        <div className="grid gap-3">
          <Checkbox label="Checkbox sm unchecked" size="sm" />
          <Checkbox defaultChecked label="Checkbox sm checked" size="sm" />
          <Checkbox label="Checkbox md unchecked" size="md" />
          <Checkbox defaultChecked label="Checkbox md checked" size="md" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [name, size] of [["Checkbox sm unchecked", 20], ["Checkbox sm checked", 20], ["Checkbox md unchecked", 24], ["Checkbox md checked", 24]] as const) {
      const indicator = indicatorFor(canvas.getByRole("checkbox", { name }));
      expectRect(indicator, size, size);
      expect(getComputedStyle(indicator).borderWidth).not.toBe("0px");
    }
  }
};

export const CheckboxStateMatrix: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Checkbox states">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <Checkbox label="Unchecked" />
          <Checkbox defaultChecked label="Checked" />
          <Checkbox label="Hover target" />
          <Checkbox defaultChecked label="Active target" />
          <Checkbox label="Focus visible" />
          <Checkbox disabled label="Disabled" />
          <Checkbox defaultChecked disabled label="Disabled checked" />
          <Checkbox error="Исправьте выбор" label="Invalid" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hover = canvas.getByRole("checkbox", { name: "Hover target" });
    await userEvent.hover(canvas.getByText("Hover target"));
    expect(indicatorFor(hover).getBoundingClientRect().width).toBeGreaterThan(0);
    const focused = canvas.getByRole("checkbox", { name: "Focus visible" });
    focused.focus();
    expect(getComputedStyle(indicatorFor(focused)).outlineStyle).toBe("solid");
  }
};

export const CheckboxIndeterminateMatrix: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Indeterminate geometry">
        <div className="grid gap-3">
          <Checkbox indeterminate label="Indeterminate sm" size="sm" />
          <Checkbox indeterminate label="Indeterminate md" size="md" />
          <Checkbox disabled indeterminate label="Indeterminate disabled" />
          <Checkbox error="Требуется выбор" indeterminate label="Indeterminate invalid" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  )
};

export const RadioGeometry: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Radio geometry">
        <div className="grid gap-3">
          <Radio defaultChecked label="Radio sm checked" name="radio-sm" size="sm" />
          <Radio defaultChecked label="Radio md checked" name="radio-md" size="md" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [name, outer, dot] of [["Radio sm checked", 20, 8], ["Radio md checked", 24, 10]] as const) {
      const indicator = indicatorFor(canvas.getByRole("radio", { name }));
      const radioDot = indicator.firstElementChild;
      if (!(radioDot instanceof HTMLElement)) throw new Error("Radio dot was not rendered.");
      expectRect(indicator, outer, outer);
      expectRect(radioDot, dot, dot);
    }
  }
};

export const RadioStateMatrix: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Radio states">
        <div className="grid gap-3">
          <Radio label="Unchecked radio" name="radio-state-a" />
          <Radio defaultChecked label="Checked radio" name="radio-state-b" />
          <Radio disabled label="Disabled radio" name="radio-state-c" />
          <Radio defaultChecked disabled label="Disabled checked radio" name="radio-state-d" />
          <RadioGroup error="Выберите период" label="Invalid group ownership" options={radioOptions} />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  )
};

export const SwitchGeometry: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Switch geometry and travel">
        <div className="grid gap-3">
          <Switch label="Switch sm off" position="start" size="sm" />
          <Switch defaultChecked label="Switch sm on" position="start" size="sm" />
          <Switch label="Switch md off" position="start" size="md" />
          <Switch defaultChecked label="Switch md on" position="start" size="md" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [name, width, height, edge] of [
      ["Switch sm off", 32, 20, "start"],
      ["Switch sm on", 32, 20, "end"],
      ["Switch md off", 40, 24, "start"],
      ["Switch md on", 40, 24, "end"]
    ] as const) {
      const indicator = indicatorFor(canvas.getByRole("switch", { name }));
      const thumb = indicator.firstElementChild;
      if (!(thumb instanceof HTMLElement)) throw new Error("Switch thumb was not rendered.");
      expectRect(indicator, width, height);
      expectThumbInset(indicator, thumb, edge);
    }
  }
};

export const SwitchStateMatrix: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Switch states">
        <div className="grid gap-3">
          <Switch label="Off" />
          <Switch defaultChecked label="On" />
          <Switch label="Focus switch" />
          <Switch disabled label="Disabled off" />
          <Switch defaultChecked disabled label="Disabled on" />
          <Switch error="Настройка недоступна" label="Invalid switch" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  )
};

export const LabelAlignment: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="First-line alignment">
        <div className="grid max-w-xl gap-4">
          <Checkbox label="Одиночная строка sm" size="sm" />
          <Checkbox label="Одиночная строка md" size="md" />
          <Checkbox description="Описание остаётся отдельной строкой и не центрирует indicator по всей высоте." label="Подпись с описанием" />
          <div style={{ fontFamily: "system-ui, sans-serif" }}>
            <Radio description="System UI fallback with descenders: Ag gj 08 99+" label="Системный шрифт Дру" />
          </div>
        </div>
      </CalibrationSection>
    </CalibrationPage>
  )
};

export const LongTextAndWrapping: Story = {
  render: () => (
    <CalibrationPage>
      {[320, 390, 768, 1440].map((width) => (
        <CalibrationSection key={width} title={`${width}px container`}>
          <div data-calibration-width={width} style={{ maxWidth: "100%", width }}>
            <Checkbox
              block
              description="Длинное описание проверяет перенос, отсутствие clipping и стабильное выравнивание первой строки на разных ширинах."
              label="Очень длинная подпись выбора для репрезентативной responsive-проверки"
            />
          </div>
        </CalibrationSection>
      ))}
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    for (const width of [320, 390]) {
      const fixture = canvasElement.querySelector(`[data-calibration-width="${width}"]`);
      if (!(fixture instanceof HTMLElement)) throw new Error(`Missing ${width}px fixture.`);
      expect(fixture.scrollWidth).toBeLessThanOrEqual(fixture.clientWidth);
    }
  }
};

export const GroupSpacing: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Group spacing">
        <CheckboxGroup defaultValue={["email"]} description="Можно выбрать несколько" label="Каналы" options={checkboxOptions} required />
        <RadioGroup defaultValue="daily" error="Проверьте период" label="Период" options={radioOptions} />
        <RadioGroup defaultValue="daily" label="Horizontal wrapping" options={radioOptions} orientation="horizontal" />
      </CalibrationSection>
    </CalibrationPage>
  )
};

export const PositionStartEnd: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Logical positioning">
        <div className="grid max-w-lg gap-3">
          <Checkbox block label="Checkbox start" position="start" />
          <Checkbox block label="Checkbox end" position="end" />
          <Radio block label="Radio start" position="start" />
          <Radio block label="Radio end" position="end" />
          <Switch block label="Switch start" position="start" />
          <Switch block label="Switch end" position="end" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  )
};

export const RuntimeBrandMatrix: Story = {
  render: () => (
    <CalibrationPage>
      {brands.map((fixture) => (
        <DesignSystemProvider {...("brand" in fixture ? { brand: fixture.brand } : {})} key={fixture.name}>
          <CalibrationSection title={fixture.name}>
            <div className="flex flex-wrap gap-4">
              <Checkbox defaultChecked label="Checkbox" />
              <Radio defaultChecked label="Radio" name={`brand-${fixture.name}`} />
              <Switch defaultChecked label="Switch" position="start" />
            </div>
          </CalibrationSection>
        </DesignSystemProvider>
      ))}
    </CalibrationPage>
  )
};

export const DarkModeMatrix: Story = {
  render: () => (
    <DesignSystemProvider mode="dark">
      <CalibrationPage>
        <CalibrationSection title="Dark mode states">
          <div className="grid gap-3">
            <Checkbox label="Dark unchecked" />
            <Checkbox defaultChecked label="Dark checked" />
            <Checkbox disabled label="Dark disabled" />
            <Radio defaultChecked label="Dark radio" />
            <Switch label="Dark switch off" />
            <Switch defaultChecked label="Dark switch on" />
            <Switch error="Ошибка настройки" label="Dark invalid" />
          </div>
        </CalibrationSection>
      </CalibrationPage>
    </DesignSystemProvider>
  )
};

export const ForcedColorsMatrix: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Forced-colors semantic matrix">
        <div className="grid gap-3">
          <Checkbox label="FC unchecked" />
          <Checkbox defaultChecked label="FC checked" />
          <Checkbox indeterminate label="FC indeterminate" />
          <Checkbox disabled label="FC disabled" />
          <Radio defaultChecked label="FC radio" />
          <Switch label="FC switch off" />
          <Switch defaultChecked label="FC switch on" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    if (!matchMedia("(forced-colors: active)").matches) return;
    const canvas = within(canvasElement);
    for (const name of ["FC unchecked", "FC checked", "FC indeterminate", "FC radio", "FC switch off", "FC switch on"]) {
      const role = name.includes("radio") ? "radio" : name.includes("switch") ? "switch" : "checkbox";
      const indicator = indicatorFor(canvas.getByRole(role, { name }));
      expect(getComputedStyle(indicator).forcedColorAdjust).toBe("none");
      expect(getComputedStyle(indicator).borderWidth).not.toBe("0px");
    }
  }
};

export const Zoom125: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Deterministic 125% CSS zoom">
        <div className="grid gap-3" data-zoom-125="" style={{ zoom: 1.25 }}>
          <Checkbox defaultChecked label="Zoom checkbox sm" size="sm" />
          <Checkbox defaultChecked label="Zoom checkbox md" size="md" />
          <Radio defaultChecked label="Zoom radio md" />
          <Switch defaultChecked label="Zoom switch sm" position="start" size="sm" />
          <Switch defaultChecked label="Zoom switch md" position="start" size="md" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [name, width, height] of [
      ["Zoom checkbox sm", 25, 25],
      ["Zoom checkbox md", 30, 30],
      ["Zoom radio md", 30, 30],
      ["Zoom switch sm", 40, 25],
      ["Zoom switch md", 50, 30]
    ] as const) {
      const role = name.includes("radio") ? "radio" : name.includes("switch") ? "switch" : "checkbox";
      expectRect(indicatorFor(canvas.getByRole(role, { name })), width, height);
    }
  }
};

export const RTL: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="RTL logical travel">
        <div className="grid gap-3" dir="rtl">
          <Checkbox label="RTL checkbox" />
          <Radio defaultChecked label="RTL radio" />
          <Switch label="RTL switch off" position="start" />
          <Switch defaultChecked label="RTL switch on" position="start" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const offTrack = indicatorFor(canvas.getByRole("switch", { name: "RTL switch off" }));
    const onTrack = indicatorFor(canvas.getByRole("switch", { name: "RTL switch on" }));
    const offThumb = offTrack.firstElementChild;
    const onThumb = onTrack.firstElementChild;
    if (!(offThumb instanceof HTMLElement) || !(onThumb instanceof HTMLElement)) {
      throw new Error("RTL thumbs were not rendered.");
    }
    expectThumbInset(offTrack, offThumb, "end");
    expectThumbInset(onTrack, onThumb, "start");
  }
};

export const DesignerReferenceComparison: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="MP UI Kit composition, normalized to DS sizes">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="grid content-start gap-3">
            <h3 className="typo-body-strong">Чекбоксы</h3>
            <Checkbox indeterminate label="Выбрать всё" size="sm" />
            <Checkbox defaultChecked label="Отправить уведомления" size="sm" />
            <Checkbox label="Принять условия" size="sm" />
            <Checkbox disabled label="Недоступный вариант" size="sm" />
          </div>
          <div className="grid content-start gap-3">
            <h3 className="typo-body-strong">Радио-кнопки</h3>
            <Radio defaultChecked label="Ежедневно" name="designer-reference" size="sm" />
            <Radio label="Еженедельно" name="designer-reference" size="sm" />
            <Radio label="Ежемесячно" name="designer-reference" size="sm" />
            <Radio disabled label="Недоступный вариант" name="designer-reference" size="sm" />
          </div>
          <div className="grid content-start gap-3">
            <h3 className="typo-body-strong">Переключатели</h3>
            <Switch label="Тёмная тема" position="start" />
            <Switch defaultChecked label="Push-уведомления" position="start" />
            <Switch defaultChecked label="Автосохранение" position="start" />
            <Switch label="Двойная аутентификация" position="start" />
          </div>
        </div>
      </CalibrationSection>
    </CalibrationPage>
  )
};
