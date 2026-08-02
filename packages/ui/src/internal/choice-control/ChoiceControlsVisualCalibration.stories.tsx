/* eslint-disable design-system/no-design-literals -- Deliberate visual calibration fixtures and runtime-brand stress cases. */
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
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
const brandModes = ["light", "dark"] as const;

function CalibrationSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 rounded-lg border border-border-default bg-background-surface p-4">
      <h2 className="typo-heading-sm text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

function CalibrationPage({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 bg-background-page p-6 text-text-primary">{children}</div>;
}

function indicatorFor(control: HTMLElement): HTMLElement {
  const indicator = control.nextElementSibling;
  if (!(indicator instanceof HTMLElement)) throw new Error("Choice indicator was not rendered.");
  return indicator;
}

function expectRect(element: Element, width: number, height: number) {
  const rect = element.getBoundingClientRect();
  expect(Math.round(rect.width)).toBe(width);
  expect(Math.round(rect.height)).toBe(height);
}

function expectContained(outer: Element, inner: Element) {
  const outerRect = outer.getBoundingClientRect();
  const innerRect = inner.getBoundingClientRect();
  expect(innerRect.left).toBeGreaterThanOrEqual(outerRect.left);
  expect(innerRect.top).toBeGreaterThanOrEqual(outerRect.top);
  expect(innerRect.right).toBeLessThanOrEqual(outerRect.right);
  expect(innerRect.bottom).toBeLessThanOrEqual(outerRect.bottom);
}

function expectCentered(outer: Element, inner: Element) {
  const outerRect = outer.getBoundingClientRect();
  const innerRect = inner.getBoundingClientRect();
  const deltaX = Math.abs((outerRect.left + outerRect.width / 2) - (innerRect.left + innerRect.width / 2));
  const deltaY = Math.abs((outerRect.top + outerRect.height / 2) - (innerRect.top + innerRect.height / 2));
  expect(deltaX).toBeLessThanOrEqual(0.5);
  expect(deltaY).toBeLessThanOrEqual(0.5);
}

function SemanticProbes() {
  const probeStyle = {
    blockSize: 1,
    inlineSize: 1,
    overflow: "hidden",
    position: "absolute"
  } as const;

  return (
    <span aria-hidden="true">
      <span data-control-border-hover-probe="" style={{ ...probeStyle, backgroundColor: "var(--ds-control-border-hover)" }} />
      <span data-primary-hover-probe="" style={{ ...probeStyle, backgroundColor: "var(--ds-action-primary-background-hover)" }} />
      <span data-primary-active-probe="" style={{ ...probeStyle, backgroundColor: "var(--ds-action-primary-background-active)" }} />
      <span data-selection-indicator-probe="" style={{ ...probeStyle, backgroundColor: "var(--ds-control-selection-indicator)" }} />
      <span data-selection-indicator-hover-probe="" style={{ ...probeStyle, backgroundColor: "var(--ds-control-selection-indicator-hover)" }} />
      <span data-selection-indicator-active-probe="" style={{ ...probeStyle, backgroundColor: "var(--ds-control-selection-indicator-active)" }} />
    </span>
  );
}

function parseRgb(color: string) {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) throw new Error(`Unsupported computed color: ${color}`);
  return channels;
}

function luminance(color: string) {
  const channels = parseRgb(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (channels[0] ?? 0)
    + 0.7152 * (channels[1] ?? 0)
    + 0.0722 * (channels[2] ?? 0);
}

function contrast(first: string, second: string) {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
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

function expectLogicalThumbInset(
  track: HTMLElement,
  thumb: HTMLElement,
  direction: "ltr" | "rtl",
  checked: boolean
) {
  const edge = direction === "ltr"
    ? checked ? "end" : "start"
    : checked ? "start" : "end";
  expectThumbInset(track, thumb, edge);
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
    for (const [name, markSize] of [["Checkbox sm checked", 12], ["Checkbox md checked", 16]] as const) {
      const indicator = indicatorFor(canvas.getByRole("checkbox", { name }));
      const checkmark = indicator.querySelector("svg");
      if (!(checkmark instanceof SVGSVGElement)) throw new Error("Checkbox checkmark was not rendered.");
      expectRect(checkmark, markSize, markSize);
      expect(getComputedStyle(checkmark).display).not.toBe("none");
      expect(getComputedStyle(checkmark).stroke).not.toBe("none");
      expect(checkmark.getAttribute("stroke-width")).not.toBeNull();
      expectContained(indicator, checkmark);
      expectCentered(indicator, checkmark);
    }
  }
};

export const CheckboxStateMatrix: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Checkbox states">
        <SemanticProbes />
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
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [name, markSize] of [["Indeterminate sm", 12], ["Indeterminate md", 16]] as const) {
      const indicator = indicatorFor(canvas.getByRole("checkbox", { name }));
      const [checkmark, minus] = indicator.querySelectorAll("svg");
      if (!(checkmark instanceof SVGSVGElement) || !(minus instanceof SVGSVGElement)) {
        throw new Error("Indeterminate marks were not rendered.");
      }
      expect(getComputedStyle(checkmark).display).toBe("none");
      expect(getComputedStyle(minus).display).not.toBe("none");
      expectRect(minus, markSize, markSize);
      expect(minus.getBoundingClientRect().width).toBeLessThan(indicator.clientWidth);
      expectContained(indicator, minus);
      expectCentered(indicator, minus);
    }
  }
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
      expectContained(indicator, radioDot);
      expectCentered(indicator, radioDot);
    }
  }
};

export const RadioStateMatrix: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Radio states">
        <SemanticProbes />
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
      expectLogicalThumbInset(indicator, thumb, "ltr", edge === "end");
    }
  }
};

export const SwitchStateMatrix: Story = {
  render: () => (
    <CalibrationPage>
      <CalibrationSection title="Switch states">
        <SemanticProbes />
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
      {brandModes.flatMap((mode) => brands.map((fixture) => {
        const fixtureName = `${fixture.name} ${mode}`;
        return (
          <DesignSystemProvider
            {...("brand" in fixture ? { brand: fixture.brand } : {})}
            key={fixtureName}
            mode={mode}
          >
            <CalibrationSection title={fixtureName}>
              <SemanticProbes />
              <div className="flex flex-wrap gap-4">
                <Checkbox defaultChecked label={`Checkbox ${fixtureName}`} />
                <Radio defaultChecked label={`Radio ${fixtureName}`} name={`brand-${fixtureName}`} />
                <Switch defaultChecked label={`Switch ${fixtureName}`} position="start" />
              </div>
            </CalibrationSection>
          </DesignSystemProvider>
        );
      }))}
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    if (matchMedia("(forced-colors: active)").matches) return;
    const canvas = within(canvasElement);
    for (const mode of brandModes) {
      for (const fixture of brands) {
        const fixtureName = `${fixture.name} ${mode}`;
        const radio = canvas.getByRole("radio", { name: `Radio ${fixtureName}` });
        const indicator = indicatorFor(radio);
        const dot = indicator.firstElementChild;
        const section = indicator.closest("section");
        const probe = section?.querySelector("[data-selection-indicator-probe]");
        if (!(dot instanceof HTMLElement) || !(probe instanceof HTMLElement)) {
          throw new Error(`Incomplete runtime-brand fixture: ${fixtureName}`);
        }
        const indicatorStyle = getComputedStyle(indicator);
        const dotColor = getComputedStyle(dot).backgroundColor;
        const selectionColor = getComputedStyle(probe).backgroundColor;
        expect(indicatorStyle.borderColor).toBe(selectionColor);
        expect(dotColor).toBe(selectionColor);
        expect(contrast(selectionColor, indicatorStyle.backgroundColor)).toBeGreaterThanOrEqual(3);
      }
    }
  }
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
    for (const name of ["FC unchecked", "FC checked", "FC indeterminate", "FC disabled", "FC radio", "FC switch off", "FC switch on"]) {
      const role = name.includes("radio") ? "radio" : name.includes("switch") ? "switch" : "checkbox";
      const indicator = indicatorFor(canvas.getByRole(role, { name }));
      expect(getComputedStyle(indicator).forcedColorAdjust).toBe("none");
      expect(getComputedStyle(indicator).borderWidth).not.toBe("0px");
    }
    const disabled = indicatorFor(canvas.getByRole("checkbox", { name: "FC disabled" }));
    expect(disabled.hasAttribute("data-disabled")).toBe(true);
    const radio = canvas.getByRole("radio", { name: "FC radio" });
    const radioIndicator = indicatorFor(radio);
    const dot = radioIndicator.firstElementChild;
    if (!(dot instanceof HTMLElement)) throw new Error("Forced-colors Radio dot was not rendered.");
    expect(dot.getBoundingClientRect().width).toBeGreaterThan(0);
    radio.focus();
    expect(getComputedStyle(radioIndicator).outlineStyle).toBe("solid");
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
          <Switch label="RTL switch sm off" position="start" size="sm" />
          <Switch defaultChecked label="RTL switch sm on" position="start" size="sm" />
          <Switch label="RTL switch md off" position="start" size="md" />
          <Switch defaultChecked label="RTL switch md on" position="start" size="md" />
        </div>
      </CalibrationSection>
    </CalibrationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [name, checked, width, height] of [
      ["RTL switch sm off", false, 32, 20],
      ["RTL switch sm on", true, 32, 20],
      ["RTL switch md off", false, 40, 24],
      ["RTL switch md on", true, 40, 24]
    ] as const) {
      const track = indicatorFor(canvas.getByRole("switch", { name }));
      const thumb = track.firstElementChild;
      if (!(thumb instanceof HTMLElement)) throw new Error("RTL thumb was not rendered.");
      expectRect(track, width, height);
      expectLogicalThumbInset(track, thumb, "rtl", checked);
    }
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
