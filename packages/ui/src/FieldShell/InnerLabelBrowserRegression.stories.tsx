import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "../Input/Input";
import { MultiSelect } from "../MultiSelect/MultiSelect";
import { Select } from "../Select/Select";
import { FieldShell } from "./FieldShell";
import styles from "./InnerLabelGeometry.stories.module.css";

const options = [
  { value: "alpha", label: "Альфа", textValue: "Альфа" },
  { value: "beta", label: "Бета", textValue: "Бета" }
];

function PointerFixture() {
  const [single, setSingle] = useState<string | null>(null);
  const [multiple, setMultiple] = useState<string[]>([]);

  return (
    <div className={styles.clickGrid}>
      <Input label="Название" labelView="inner" placeholder="Введите название" />
      <Select
        block
        items={options}
        label="Один вариант"
        labelView="inner"
        onChange={setSingle}
        placeholder="Выберите вариант"
        value={single}
      />
      <MultiSelect
        block
        items={options}
        label="Несколько вариантов"
        labelView="inner"
        onChange={setMultiple}
        placeholder="Выберите варианты"
        value={multiple}
      />
    </div>
  );
}

function GeometryFixture() {
  return (
    <div className={styles.grid}>
      <Input
        defaultValue="Значение"
        label="Geometry Input sm"
        labelView="inner"
        size="sm"
      />
      <Select
        block
        items={options}
        label="Geometry Select md"
        labelView="inner"
        onChange={() => undefined}
        size="md"
        value="alpha"
      />
      <MultiSelect
        block
        items={options}
        label="Geometry MultiSelect lg"
        labelView="inner"
        onChange={() => undefined}
        size="lg"
        value={["alpha", "beta"]}
      />
    </div>
  );
}

function LongInput({ focused = false }: { focused?: boolean }) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (focused) ref.current?.focus();
  }, [focused]);

  return (
    <div className={styles.viewport390}>
      <Input
        label="Описание"
        labelView="inner"
        placeholder="Очень длинный placeholder, который должен обрезаться без пересечения с label"
        ref={ref}
      />
    </div>
  );
}

function LongSelect({ open = false }: { open?: boolean }) {
  return (
    <div className={styles.viewport390}>
      <Select
        block
        items={options}
        label="Категория"
        labelView="inner"
        onChange={() => undefined}
        open={open}
        placeholder="Очень длинный placeholder открытого Select без пересечения с label"
        value={null}
      />
    </div>
  );
}

function ResponsiveSelect() {
  const [open, setOpen] = useState(false);
  return (
    <Select
      block
      items={options}
      label="Responsive Select"
      labelView="inner"
      onChange={() => undefined}
      onOpenChange={setOpen}
      open={open}
      placeholder="Выберите вариант"
      value={null}
    />
  );
}

const meta = {
  title: "Fields/InnerLabelBrowserRegression",
  component: FieldShell,
  tags: ["test"],
  parameters: { layout: "centered" }
} satisfies Meta<typeof FieldShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PointerAndPlaceholder: Story = {
  args: {} as never,
  render: () => <PointerFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    const input = canvas.getByRole("textbox", { name: "Название" });
    const inputLabel = canvas.getByText("Название", { selector: "label" });
    const inputLabelRect = inputLabel.getBoundingClientRect();
    const inputHit = document.elementFromPoint(
      inputLabelRect.left + inputLabelRect.width / 2,
      inputLabelRect.top + inputLabelRect.height / 2
    );

    await expect(inputHit).toBe(input);
    await expect(getComputedStyle(input, "::placeholder").color)
      .toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    await userEvent.click(inputHit as HTMLElement);
    await expect(input).toHaveFocus();
    await expect(getComputedStyle(input, "::placeholder").color)
      .not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);

    const select = canvas.getByRole("button", { name: "Один вариант" });
    const selectLabel = canvas.getByText("Один вариант", { selector: "label" });
    const selectPlaceholder = select.querySelector<HTMLElement>("[data-field-placeholder]");
    if (!selectPlaceholder) throw new Error("Select placeholder was not rendered.");
    await expect(getComputedStyle(selectPlaceholder).visibility).toBe("hidden");
    const selectRect = selectLabel.getBoundingClientRect();
    const selectHit = document.elementFromPoint(
      selectRect.left + selectRect.width / 2,
      selectRect.top + selectRect.height / 2
    );
    await expect(selectHit).toBe(select);
    await userEvent.click(selectHit as HTMLElement);
    await expect(select).toHaveAttribute("aria-expanded", "true");
    await expect(getComputedStyle(selectPlaceholder).visibility).toBe("visible");
    await userEvent.keyboard("{Escape}");

    const multi = canvas.getByRole("button", { name: "Несколько вариантов" });
    const multiLabel = canvas.getByText("Несколько вариантов", { selector: "label" });
    const multiRect = multiLabel.getBoundingClientRect();
    const multiHit = document.elementFromPoint(
      multiRect.left + multiRect.width / 2,
      multiRect.top + multiRect.height / 2
    );
    await expect(multiHit).toBe(multi);
    await userEvent.click(multiHit as HTMLElement);
    await expect(multi).toHaveAttribute("aria-expanded", "true");
  }
};

export const GeometryAssertions: Story = {
  args: {} as never,
  render: () => <GeometryFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const assertBands = (control: HTMLElement, value: HTMLElement, tolerance: number) => {
      const shell = control.closest<HTMLElement>("[data-field-part=\"shell\"]");
      const label = shell?.querySelector<HTMLElement>("[data-field-part=\"inner-label\"]");
      if (!shell || !label) throw new Error("Inner field geometry was not rendered.");
      expect(label.getBoundingClientRect().bottom)
        .toBeLessThanOrEqual(value.getBoundingClientRect().top + tolerance);
      return shell;
    };

    const input = canvas.getByRole("textbox", { name: "Geometry Input sm" });
    await expect(assertBands(input, input, 4.5).getBoundingClientRect().height).toBe(32);

    const select = canvas.getByRole("button", { name: "Geometry Select md" });
    await expect(assertBands(select, select, 0.5).getBoundingClientRect().height).toBe(40);

    const multi = canvas.getByRole("button", { name: "Geometry MultiSelect lg" });
    const chip = multi.closest("[data-field-part=\"shell\"]")
      ?.querySelector<HTMLElement>("[data-field-chip]");
    if (!chip) throw new Error("MultiSelect chip was not rendered.");
    await expect(assertBands(multi, chip, 0.5).getBoundingClientRect().height).toBe(48);
  }
};

export const LongPlaceholderInputResting: Story = {
  args: {} as never,
  render: () => <LongInput />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Описание" });
    await expect(getComputedStyle(input, "::placeholder").color)
      .toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    await expect(getComputedStyle(input).textOverflow).toBe("ellipsis");
  }
};

export const LongPlaceholderInputFocused: Story = {
  args: {} as never,
  render: () => <LongInput focused />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Описание" });
    await expect(input).toHaveFocus();
    await expect(getComputedStyle(input, "::placeholder").color)
      .not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    await expect(getComputedStyle(input).textOverflow).toBe("ellipsis");
  }
};

export const LongPlaceholderSelectResting: Story = {
  args: {} as never,
  render: () => <LongSelect />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Категория" });
    const placeholder = trigger.querySelector<HTMLElement>("[data-field-placeholder]");
    if (!placeholder) throw new Error("Select placeholder was not rendered.");
    await expect(getComputedStyle(placeholder).visibility).toBe("hidden");
    await expect(getComputedStyle(placeholder).textOverflow).toBe("ellipsis");
  }
};

export const LongPlaceholderSelectFocused: Story = {
  args: {} as never,
  render: () => <LongSelect open />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Категория" });
    const placeholder = trigger.querySelector<HTMLElement>("[data-field-placeholder]");
    if (!placeholder) throw new Error("Select placeholder was not rendered.");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(getComputedStyle(placeholder).visibility).toBe("visible");
    await expect(getComputedStyle(placeholder).textOverflow).toBe("ellipsis");
    await expect(placeholder.scrollWidth).toBeGreaterThan(placeholder.clientWidth);
  }
};

const responsivePlay: Story["play"] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const document = canvasElement.ownerDocument;
  const width = document.defaultView?.innerWidth;
  const trigger = canvas.getByRole("button", { name: "Responsive Select" });
  await userEvent.click(trigger);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  if (width === 390) {
    await expect(document.querySelector("[data-modal-kind=\"bottom-sheet\"]"))
      .not.toBeNull();
  } else {
    await expect(document.querySelector("[data-floating-overlay]"))
      .not.toBeNull();
  }
};

export const ResponsiveViewport390x844: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <ResponsiveSelect />,
  play: async (context) => {
    await expect(context.canvasElement.ownerDocument.defaultView?.innerWidth).toBe(390);
    await expect(context.canvasElement.ownerDocument.defaultView?.innerHeight).toBe(844);
    await responsivePlay?.(context);
  }
};

export const ResponsiveViewport768x1024: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "tablet" } },
  render: () => <ResponsiveSelect />,
  play: async (context) => {
    await expect(context.canvasElement.ownerDocument.defaultView?.innerWidth).toBe(768);
    await expect(context.canvasElement.ownerDocument.defaultView?.innerHeight).toBe(1024);
    await responsivePlay?.(context);
  }
};

export const ResponsiveViewport1440x900: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <ResponsiveSelect />,
  play: async (context) => {
    await expect(context.canvasElement.ownerDocument.defaultView?.innerWidth).toBe(1440);
    await expect(context.canvasElement.ownerDocument.defaultView?.innerHeight).toBe(900);
    await responsivePlay?.(context);
  }
};
