import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Input } from "../Input/Input";
import { MultiSelect } from "../MultiSelect/MultiSelect";
import { Select } from "../Select/Select";
import { FieldShell } from "./FieldShell";
import styles from "./InnerLabelGeometry.stories.module.css";

const sizes = ["sm", "md", "lg"] as const;
const options = [
  { value: "one", label: "Первый", textValue: "Первый" },
  { value: "two", label: "Второй", textValue: "Второй" }
];

function ClickTargets() {
  return (
    <div className={styles.stateGrid}>
      {sizes.map((size) => (
        <div className={styles.clickGrid} data-hit-area-size={size} key={size}>
          <Input
            defaultValue="Значение"
            label={`Input ${size} filled`}
            labelView="inner"
            size={size}
          />
          <Select
            block
            items={options}
            label={`Select ${size} resting`}
            labelView="inner"
            onChange={() => undefined}
            placeholder="Выберите вариант"
            size={size}
            value={null}
          />
          <Select
            block
            items={options}
            label={`Select ${size} filled`}
            labelView="inner"
            onChange={() => undefined}
            size={size}
            value="one"
          />
          <MultiSelect
            block
            items={options}
            label={`MultiSelect ${size} filled`}
            labelView="inner"
            onChange={() => undefined}
            size={size}
            value={["one"]}
          />
        </div>
      ))}

      <div className={styles.clickGrid} data-hit-area-state-coverage="">
        <Input
          defaultValue="Недоступно"
          disabled
          label="Disabled Input"
          labelView="inner"
        />
        <Input
          defaultValue="Только чтение"
          label="Read-only Input"
          labelView="inner"
          readOnly
        />
        <Select
          block
          disabled
          items={options}
          label="Disabled Select"
          labelView="inner"
          onChange={() => undefined}
          value="one"
        />
        <Select
          block
          items={options}
          label="Read-only Select"
          labelView="inner"
          onChange={() => undefined}
          readOnly
          value="one"
        />
      </div>

      <Input
        id="outer-label-target"
        label="Внешний label"
        placeholder="Введите значение"
      />
    </div>
  );
}

type PointName =
  | "upper-left"
  | "upper-center-label"
  | "value-center"
  | "before-trailing-status"
  | "trailing-status";

function hitAt(
  document: Document,
  control: HTMLElement,
  label: HTMLElement,
  pointName: PointName
) {
  const shell = control.closest<HTMLElement>("[data-field-part=\"shell\"]");
  if (!shell) throw new Error("FieldShell was not rendered.");
  const shellRect = shell.getBoundingClientRect();
  const labelRect = label.getBoundingClientRect();
  const trailingStatus = control.querySelector<HTMLElement>(
    "[data-select-chevron], [data-multiselect-chevron]"
  );
  const trailingRect = trailingStatus?.getBoundingClientRect();

  const point = (() => {
    switch (pointName) {
      case "upper-left":
        return { x: shellRect.left + 12, y: shellRect.top + 6 };
      case "upper-center-label":
        return {
          x: labelRect.left + labelRect.width / 2,
          y: labelRect.top + labelRect.height / 2
        };
      case "value-center":
        return {
          x: shellRect.left + shellRect.width / 2,
          y: shellRect.top + shellRect.height * 0.72
        };
      case "before-trailing-status":
        return {
          x: trailingRect ? trailingRect.left - 4 : shellRect.right - 8,
          y: shellRect.top + shellRect.height * 0.72
        };
      case "trailing-status":
        if (!trailingRect) throw new Error("Trailing trigger status was not rendered.");
        return {
          x: trailingRect.left + trailingRect.width / 2,
          y: trailingRect.top + trailingRect.height / 2
        };
    }
  })();

  return document.elementFromPoint(point.x, point.y);
}

function labelFor(canvas: ReturnType<typeof within>, name: string) {
  return canvas.getByText(name, { selector: "label" });
}

async function verifyInputHitArea(
  document: Document,
  input: HTMLInputElement,
  label: HTMLElement
) {
  for (const pointName of [
    "upper-left",
    "upper-center-label",
    "value-center",
    "before-trailing-status"
  ] as const) {
    input.blur();
    const hit = hitAt(document, input, label, pointName);
    expect(hit, `${input.getAttribute("aria-label") ?? input.id}: ${pointName}`)
      .toBe(input);
    await userEvent.click(hit as HTMLElement);
    expect(input).toHaveFocus();
  }
}

async function verifyTriggerHitArea(
  document: Document,
  trigger: HTMLElement,
  label: HTMLElement
) {
  for (const pointName of [
    "upper-left",
    "upper-center-label",
    "value-center",
    "before-trailing-status",
    "trailing-status"
  ] as const) {
    trigger.blur();
    const hit = hitAt(document, trigger, label, pointName);
    expect(hit, `${trigger.getAttribute("aria-label") ?? trigger.id}: ${pointName}`)
      .toBe(trigger);
    await userEvent.click(hit as HTMLElement);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  }
}

const meta = {
  title: "Fields/InnerLabelClickBehavior",
  component: FieldShell,
  parameters: { layout: "centered" },
  tags: ["test"]
} satisfies Meta<typeof FieldShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PointerTransparentLabel: Story = {
  args: {} as never,
  render: () => <ClickTargets />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;

    for (const size of sizes) {
      const inputName = `Input ${size} filled`;
      const input = canvas.getByRole<HTMLInputElement>("textbox", {
        name: inputName
      });
      await verifyInputHitArea(document, input, labelFor(canvas, inputName));

      for (const state of ["resting", "filled"] as const) {
        const selectName = `Select ${size} ${state}`;
        const select = canvas.getByRole("button", { name: selectName });
        await verifyTriggerHitArea(document, select, labelFor(canvas, selectName));
      }

      const multiName = `MultiSelect ${size} filled`;
      const multi = canvas.getByRole("button", { name: multiName });
      await verifyTriggerHitArea(document, multi, labelFor(canvas, multiName));
    }

    const disabledInput = canvas.getByRole<HTMLInputElement>("textbox", {
      name: "Disabled Input"
    });
    const disabledInputHit = hitAt(
      document,
      disabledInput,
      labelFor(canvas, "Disabled Input"),
      "upper-center-label"
    );
    expect(disabledInputHit).toBe(disabledInput);
    await userEvent.click(disabledInputHit as HTMLElement);
    expect(disabledInput).not.toHaveFocus();

    const readOnlyInput = canvas.getByRole<HTMLInputElement>("textbox", {
      name: "Read-only Input"
    });
    const readOnlyInputHit = hitAt(
      document,
      readOnlyInput,
      labelFor(canvas, "Read-only Input"),
      "upper-center-label"
    );
    expect(readOnlyInputHit).toBe(readOnlyInput);
    await userEvent.click(readOnlyInputHit as HTMLElement);
    expect(readOnlyInput).toHaveFocus();

    const disabledSelect = canvas.getByRole("button", { name: "Disabled Select" });
    const disabledSelectHit = hitAt(
      document,
      disabledSelect,
      labelFor(canvas, "Disabled Select"),
      "upper-center-label"
    );
    expect(disabledSelectHit).toBe(disabledSelect);
    await userEvent.click(disabledSelectHit as HTMLElement);
    expect(disabledSelect).toBeDisabled();
    expect(disabledSelect).toHaveAttribute("aria-expanded", "false");

    const readOnlySelect = canvas.getByRole("button", { name: "Read-only Select" });
    const readOnlySelectHit = hitAt(
      document,
      readOnlySelect,
      labelFor(canvas, "Read-only Select"),
      "upper-center-label"
    );
    expect(readOnlySelectHit).toBe(readOnlySelect);
    await userEvent.click(readOnlySelectHit as HTMLElement);
    expect(readOnlySelect).toHaveFocus();
    expect(readOnlySelect).toHaveAttribute("aria-expanded", "false");

    const outerInput = canvas.getByRole("textbox", { name: "Внешний label" });
    await userEvent.click(canvas.getByText("Внешний label", { selector: "label" }));
    expect(outerInput).toHaveFocus();
  }
};
