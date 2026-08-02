import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { MultiSelect } from "../../MultiSelect/MultiSelect";
import { Select } from "../../Select/Select";

const items = [
  { value: "alpha", label: "Альфа", textValue: "Альфа" },
  { value: "beta", label: "Бета", textValue: "Бета" }
];

function SharedFloatingTriggerFixture() {
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [multiValue, setMultiValue] = useState<string[]>([]);
  const [selectOpen, setSelectOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);
  const selectTransitions = useRef<boolean[]>([]);
  const multiTransitions = useRef<boolean[]>([]);
  return (
    <div style={{ display: "grid", gap: "var(--ds-space-3)", inlineSize: "28rem" }}>
      <Select
        items={items}
        label="Общий Select trigger"
        onChange={setSelectValue}
        onOpenChange={(nextOpen) => {
          selectTransitions.current.push(nextOpen);
          setSelectOpen(nextOpen);
        }}
        open={selectOpen}
        value={selectValue}
      />
      <output aria-label="Общий Select transitions">
        {selectTransitions.current.map(String).join(",")}
      </output>
      <MultiSelect
        items={items}
        label="Общий MultiSelect trigger"
        onChange={setMultiValue}
        onOpenChange={(nextOpen) => {
          multiTransitions.current.push(nextOpen);
          setMultiOpen(nextOpen);
        }}
        open={multiOpen}
        value={multiValue}
      />
      <output aria-label="Общий MultiSelect transitions">
        {multiTransitions.current.map(String).join(",")}
      </output>
    </div>
  );
}

const meta = {
  title: "Internal/SharedFloatingTriggerBrowserRegression",
  component: Select,
  tags: ["test"]
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RepeatedActivation: Story = {
  args: {} as never,
  render: () => <SharedFloatingTriggerFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const cases = [
      {
        trigger: canvas.getByRole("button", { name: "Общий Select trigger" }),
        transitions: canvas.getByRole("status", { name: "Общий Select transitions" }),
        visualSelector: "[data-select-chevron]"
      },
      {
        trigger: canvas.getByRole("button", { name: "Общий MultiSelect trigger" }),
        transitions: canvas.getByRole("status", { name: "Общий MultiSelect transitions" }),
        visualSelector: "[data-multiselect-chevron]"
      }
    ];

    for (const { trigger, transitions, visualSelector } of cases) {
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(transitions).toHaveTextContent("");
      await userEvent.click(trigger);
      await expect(await body.findByRole("listbox")).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(transitions).toHaveTextContent("true");
      const visualRoot = trigger.closest<HTMLElement>("[data-field-part='shell']")
        ?? trigger;
      const visualTarget = visualRoot.querySelector<HTMLElement>(visualSelector);
      if (!visualTarget) throw new Error(`Missing trigger target ${visualSelector}.`);
      await userEvent.click(visualTarget);
      await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(transitions).toHaveTextContent("true,false");
      await userEvent.click(trigger);
      await expect(await body.findByRole("listbox")).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(transitions).toHaveTextContent("true,false,true");
      await expect(trigger).toBeInTheDocument();
      await userEvent.click(trigger);
      await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
      await expect(transitions).toHaveTextContent("true,false,true,false");
    }
  }
};
