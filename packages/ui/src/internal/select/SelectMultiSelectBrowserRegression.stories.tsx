import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { User } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Dialog } from "../../Dialog/Dialog";
import { Input } from "../../Input/Input";
import { MultiSelect } from "../../MultiSelect/MultiSelect";
import { Select } from "../../Select/Select";
import type { SelectCollectionItem } from "./collection";
import styles from "./SelectStories.module.css";

const baseItems: SelectCollectionItem[] = [
  { value: "alpha", label: "Альфа", textValue: "Альфа" },
  { value: "beta", label: "Бета", textValue: "Бета" },
  { value: "gamma", label: "Гамма", textValue: "Гамма" }
];

const longItems: SelectCollectionItem[] = Array.from(
  { length: 120 },
  (_, index) => ({
    value: `option-${index}`,
    label: `Вариант ${index + 1}`,
    textValue: `Вариант ${index + 1}`
  })
);

const virtualItems: SelectCollectionItem[] = Array.from(
  { length: 10000 },
  (_, index) => ({
    value: `virtual-${index}`,
    label: `Виртуальный вариант ${index + 1}`,
    textValue: `Виртуальный вариант ${index + 1}`
  })
);

const groupedLargeItems: SelectCollectionItem[] = Array.from(
  { length: 6 },
  (_, groupIndex) => ({
    type: "group",
    id: `browser-group-${groupIndex}`,
    label: `Группа ${groupIndex + 1}`,
    items: Array.from({ length: 100 }, (_, optionIndex) => ({
      value: `browser-${groupIndex}-${optionIndex}`,
      label: `Вариант ${groupIndex + 1}.${optionIndex + 1}`,
      textValue: `Вариант ${groupIndex + 1}.${optionIndex + 1}`
    }))
  })
);

function SelectFixture({ searchable = false }: { searchable?: boolean }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Select
      block
      items={longItems}
      label="Клиент"
      locale="ru-RU"
      onChange={setValue}
      placeholder="Выберите клиента"
      searchable={searchable}
      value={value}
    />
  );
}

function MultiFixture({ searchable = false }: { searchable?: boolean }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <MultiSelect
      block
      items={longItems}
      label="Теги"
      locale="ru-RU"
      onChange={setValue}
      placeholder="Выберите теги"
      searchable={searchable}
      value={value}
    />
  );
}

function ReadOnlyFixture() {
  const [selectValue, setSelectValue] = useState<string | null>("alpha");
  const [placeholderValue, setPlaceholderValue] = useState<string | null>(null);
  const [summaryValue, setSummaryValue] = useState<string[]>(["alpha", "beta"]);
  const [chipsValue, setChipsValue] = useState<string[]>(["alpha", "beta"]);
  const transitions = useRef<string[]>([]);
  return (
    <div className={styles.stack}>
      <Select
        clearable
        items={[
          {
            value: "alpha",
            label: "Альфа",
            textValue: "Альфа",
            leading: <User aria-hidden="true" />
          },
          ...baseItems.slice(1)
        ]}
        label="ReadOnly Select value"
        locale="ru-RU"
        onChange={setSelectValue}
        onOpenChange={(open) => transitions.current.push(`select:${open}`)}
        readOnly
        value={selectValue}
      />
      <Select
        clearable
        items={baseItems}
        label="ReadOnly Select placeholder"
        locale="ru-RU"
        onChange={setPlaceholderValue}
        onOpenChange={(open) => transitions.current.push(`placeholder:${open}`)}
        placeholder="Выберите клиента"
        readOnly
        value={placeholderValue}
      />
      <MultiSelect
        clearable
        items={baseItems}
        label="ReadOnly MultiSelect summary"
        labelView="inner"
        locale="ru-RU"
        onChange={setSummaryValue}
        onOpenChange={(open) => transitions.current.push(`summary:${open}`)}
        readOnly
        value={summaryValue}
      />
      <MultiSelect
        clearable
        items={baseItems}
        label="ReadOnly MultiSelect chips"
        locale="ru-RU"
        onChange={setChipsValue}
        onOpenChange={(open) => transitions.current.push(`chips:${open}`)}
        readOnly
        value={chipsValue}
      />
      <output aria-label="ReadOnly values">
        {[selectValue ?? "null", placeholderValue ?? "null", summaryValue.join(","), chipsValue.join(",")].join("|")}
      </output>
      <output aria-label="ReadOnly transitions">{transitions.current.join(",")}</output>
    </div>
  );
}

function WidthFixture() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className={styles.width240} data-width-fixture="">
      <MultiSelect
        block
        clearable
        items={longItems}
        label="Stable width"
        locale="ru-RU"
        onChange={setValue}
        value={value}
      />
      <button onClick={() => setValue(longItems.slice(0, 20).map((item) =>
        item.type === "action" || item.type === "group" ? "" : item.value
      ))} type="button">
        Select 20
      </button>
      <button onClick={() => setValue([])} type="button">Clear fixture</button>
    </div>
  );
}

function VirtualFixture() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Select
      block
      items={virtualItems}
      label="Virtual Select"
      locale="ru-RU"
      onChange={setValue}
      searchable
      value={value}
    />
  );
}

function ActionToDialogFixture() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [value, setValue] = useState<string | null>("alpha");
  const [calls, setCalls] = useState(0);
  const items: SelectCollectionItem[] = [
    ...baseItems,
    {
      type: "action",
      id: "create",
      label: "Создать клиента",
      onSelect: () => {
        setCalls((count) => count + 1);
        setDialogOpen(true);
      },
      textValue: "Создать клиента"
    }
  ];

  return (
    <>
      <Select
        items={items}
        label="Action Select"
        locale="ru-RU"
        onChange={setValue}
        value={value}
      />
      <output aria-label="Action calls">{calls}</output>
      <Dialog
        closeLabel="Закрыть"
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="Новый клиент"
      >
        Форма клиента
      </Dialog>
    </>
  );
}

function SelectActionFocusFixture({
  allActionsDisabled = false,
  searchable
}: {
  allActionsDisabled?: boolean;
  searchable: boolean;
}) {
  const [value, setValue] = useState<string | null>("alpha");
  const [calls, setCalls] = useState(0);
  const items: SelectCollectionItem[] = [
    {
      type: "action",
      id: "disabled-create",
      label: "Недоступное действие",
      textValue: "Недоступное действие",
      disabled: true,
      onSelect: () => setCalls((count) => count + 100)
    },
    ...(!allActionsDisabled ? [{
      type: "action",
      id: "create",
      label: "Создать клиента",
      textValue: "Создать клиента",
      onSelect: () => setCalls((count) => count + 1)
    } satisfies SelectCollectionItem] : []),
    ...baseItems
  ];
  return (
    <>
      <Select
        items={items}
        label="Action focus Select"
        locale="ru-RU"
        onChange={setValue}
        searchable={searchable}
        value={value}
      />
      <output aria-label="Select action calls">{calls}</output>
      <output aria-label="Select value">{value}</output>
    </>
  );
}

function MultiActionFocusFixture({ searchable }: { searchable: boolean }) {
  const [value, setValue] = useState<string[]>(["alpha"]);
  const [calls, setCalls] = useState(0);
  const items: SelectCollectionItem[] = [
    {
      type: "action",
      id: "disabled-create",
      label: "Недоступное действие",
      textValue: "Недоступное действие",
      disabled: true,
      onSelect: () => setCalls((count) => count + 100)
    },
    {
      type: "action",
      id: "create",
      label: "Создать тег",
      textValue: "Создать тег",
      onSelect: () => setCalls((count) => count + 1)
    },
    ...baseItems
  ];
  return (
    <>
      <MultiSelect
        items={items}
        label="Action focus MultiSelect"
        locale="ru-RU"
        onChange={setValue}
        searchable={searchable}
        value={value}
      />
      <output aria-label="MultiSelect action calls">{calls}</output>
      <output aria-label="MultiSelect value">{value.join(",")}</output>
    </>
  );
}

function GroupedLargeFixture({ multiple }: { multiple: boolean }) {
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [multiValue, setMultiValue] = useState<string[]>([]);
  return multiple ? (
    <MultiSelect
      items={groupedLargeItems}
      label="Grouped MultiSelect"
      locale="ru-RU"
      onChange={setMultiValue}
      value={multiValue}
    />
  ) : (
    <Select
      items={groupedLargeItems}
      label="Grouped Select"
      locale="ru-RU"
      onChange={setSelectValue}
      value={selectValue}
    />
  );
}

function TriggerToggleFixture() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const transitions = useRef<boolean[]>([]);
  return (
    <div>
      <Select
        items={baseItems}
        label="Trigger toggle"
        onChange={setValue}
        onOpenChange={(nextOpen) => {
          transitions.current.push(nextOpen);
          setOpen(nextOpen);
        }}
        open={open}
        searchable
        value={value}
      />
      <button type="button">Outside target</button>
      <output aria-label="Open transitions">
        {transitions.current.map(String).join(",")}
      </output>
    </div>
  );
}

function UncontrolledTriggerToggleFixture() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div>
      <Select
        items={baseItems}
        label="Uncontrolled trigger toggle"
        onChange={setValue}
        value={value}
      />
      <button type="button">Uncontrolled outside target</button>
    </div>
  );
}

function DisabledFixture() {
  return (
    <div className={styles.stack}>
      <Select
        disabled
        items={baseItems}
        label="Disabled Select"
        onChange={() => undefined}
        value={null}
      />
      <MultiSelect
        disabled
        items={baseItems}
        label="Disabled MultiSelect"
        onChange={() => undefined}
        value={[]}
      />
    </div>
  );
}

function SelectTriggerHitRegionFixture() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>("alpha");
  const transitions = useRef<boolean[]>([]);
  const [refreshingOpen, setRefreshingOpen] = useState(false);
  const refreshingTransitions = useRef<boolean[]>([]);
  return (
    <div className={styles.stack}>
      <div className={styles.width320}>
        <Select
          block
          clearable
          items={baseItems}
          label="Hit region Select"
          locale="ru-RU"
          onChange={setValue}
          onOpenChange={(nextOpen) => {
            transitions.current.push(nextOpen);
            setOpen(nextOpen);
          }}
          open={open}
          searchable
          value={value}
        />
      </div>
      <button onClick={() => setValue("alpha")} type="button">Reset Select value</button>
      <output aria-label="Hit region Select value">{value ?? "null"}</output>
      <output aria-label="Hit region Select transitions">
        {transitions.current.map(String).join(",")}
      </output>
      <div className={styles.width320}>
        <Select
          block
          collectionState={{ status: "refreshing" }}
          items={baseItems}
          label="Refreshing hit region Select"
          onChange={() => undefined}
          onOpenChange={(nextOpen) => {
            refreshingTransitions.current.push(nextOpen);
            setRefreshingOpen(nextOpen);
          }}
          open={refreshingOpen}
          value="alpha"
        />
      </div>
      <output aria-label="Refreshing Select transitions">
        {refreshingTransitions.current.map(String).join(",")}
      </output>
      <div className={styles.width320}>
        <Select
          block
          items={baseItems}
          label="Placeholder hit region Select"
          onChange={() => undefined}
          placeholder="Choose a client"
          value={null}
        />
      </div>
    </div>
  );
}

function MultiSelectTriggerHitRegionFixture() {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryValue, setSummaryValue] = useState<string[]>([]);
  const summaryTransitions = useRef<boolean[]>([]);
  const [chipsOpen, setChipsOpen] = useState(false);
  const [chipsValue, setChipsValue] = useState<string[]>(["alpha", "beta"]);
  const chipsTransitions = useRef<boolean[]>([]);
  return (
    <div className={styles.stack}>
      <div className={styles.width320}>
        <MultiSelect
          block
          items={baseItems}
          label="Summary hit region MultiSelect"
          labelView="inner"
          locale="ru-RU"
          onChange={setSummaryValue}
          onOpenChange={(nextOpen) => {
            summaryTransitions.current.push(nextOpen);
            setSummaryOpen(nextOpen);
          }}
          open={summaryOpen}
          placeholder="Choose tags"
          value={summaryValue}
        />
      </div>
      <button onClick={() => setSummaryValue(["alpha", "beta"])} type="button">
        Set summary values
      </button>
      <output aria-label="Summary MultiSelect transitions">
        {summaryTransitions.current.map(String).join(",")}
      </output>
      <div className={styles.width320}>
        <MultiSelect
          block
          clearable
          items={baseItems}
          label="Chips hit region MultiSelect"
          locale="ru-RU"
          onChange={setChipsValue}
          onOpenChange={(nextOpen) => {
            chipsTransitions.current.push(nextOpen);
            setChipsOpen(nextOpen);
          }}
          open={chipsOpen}
          value={chipsValue}
        />
      </div>
      <button onClick={() => setChipsValue(["alpha", "beta"])} type="button">
        Reset chip values
      </button>
      <output aria-label="Chips MultiSelect value">{chipsValue.join(",")}</output>
      <output aria-label="Chips MultiSelect transitions">
        {chipsTransitions.current.map(String).join(",")}
      </output>
    </div>
  );
}

function LoadingSpinnerHitRegionFixture() {
  const [selectOpen, setSelectOpen] = useState(false);
  const selectTransitions = useRef<boolean[]>([]);
  const [multiOpen, setMultiOpen] = useState(false);
  const multiTransitions = useRef<boolean[]>([]);
  const [refreshingMultiOpen, setRefreshingMultiOpen] = useState(false);
  const refreshingMultiTransitions = useRef<boolean[]>([]);
  return (
    <div className={styles.stack}>
      <Select
        collectionState={{ status: "loading" }}
        items={[]}
        label="Loading spinner Select"
        onChange={() => undefined}
        onOpenChange={(open) => {
          selectTransitions.current.push(open);
          setSelectOpen(open);
        }}
        open={selectOpen}
        value={null}
      />
      <output aria-label="Loading Select transitions">
        {selectTransitions.current.map(String).join(",")}
      </output>
      <MultiSelect
        collectionState={{ status: "loading" }}
        items={[]}
        label="Loading spinner MultiSelect"
        onChange={() => undefined}
        onOpenChange={(open) => {
          multiTransitions.current.push(open);
          setMultiOpen(open);
        }}
        open={multiOpen}
        value={[]}
      />
      <output aria-label="Loading MultiSelect transitions">
        {multiTransitions.current.map(String).join(",")}
      </output>
      <MultiSelect
        collectionState={{ status: "refreshing" }}
        items={baseItems}
        label="Refreshing spinner MultiSelect"
        onChange={() => undefined}
        onOpenChange={(open) => {
          refreshingMultiTransitions.current.push(open);
          setRefreshingMultiOpen(open);
        }}
        open={refreshingMultiOpen}
        value={["alpha"]}
      />
      <output aria-label="Refreshing MultiSelect transitions">
        {refreshingMultiTransitions.current.map(String).join(",")}
      </output>
    </div>
  );
}

function TriggerHitRegionGeometryFixture() {
  const longItem: SelectCollectionItem = {
    value: "long",
    label: "Pending gjpqy Черновик ӘҒҚҢӨҰҮҺІ 99+ ₸",
    textValue: "Pending gjpqy Черновик ӘҒҚҢӨҰҮҺІ 99+ ₸",
    leading: <User aria-hidden="true" />
  };
  return (
    <div className={styles.stack}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div className={styles.width320} data-trigger-geometry-row={size} key={size}>
          <Select
            block
            clearable
            collectionState={{ status: "refreshing" }}
            items={[longItem]}
            label={`Geometry Select ${size}`}
            labelView={size === "md" ? "outer" : "inner"}
            onChange={() => undefined}
            selectedItem={longItem}
            size={size}
            value="long"
          />
          <MultiSelect
            block
            clearable
            items={baseItems}
            label={`Geometry MultiSelect ${size}`}
            labelView={size === "md" ? "outer" : "inner"}
            onChange={() => undefined}
            size={size}
            value={["alpha", "beta"]}
          />
        </div>
      ))}
    </div>
  );
}

function FieldValueTypographyFixture() {
  const roles = {
    sm: "fieldValueTextSm",
    md: "fieldValueTextMd",
    lg: "fieldValueTextLg"
  } as const;
  return (
    <div>
      {(["sm", "md", "lg"] as const).map((size) => (
        <section data-field-value-row={size} data-expected-role={roles[size]} key={size}>
          <Input aria-label={`Input ${size}`} size={size} value="Pending gjpqy Черновик ҰҒҚҮӘӨ 99+" readOnly />
          <Select
            items={baseItems}
            label={`Select ${size}`}
            onChange={() => undefined}
            size={size}
            value="alpha"
          />
          <MultiSelect
            items={baseItems}
            label={`Multi empty ${size}`}
            labelView="inner"
            onChange={() => undefined}
            placeholder="Черновик ҰҒҚҮӘӨ 99+"
            size={size}
            value={[]}
          />
          <MultiSelect
            items={baseItems}
            label={`Multi selected ${size}`}
            labelView="inner"
            onChange={() => undefined}
            size={size}
            value={["alpha", "beta"]}
          />
        </section>
      ))}
    </div>
  );
}

function resolveVisualHitTarget(target: HTMLElement, trigger: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const hit = target.ownerDocument.elementFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );
  if (!(hit instanceof HTMLElement) || !trigger.contains(hit)) {
    throw new Error("Visual target does not resolve to its owning trigger.");
  }
  return hit;
}

const meta = {
  title: "Fields/SelectMultiSelectBrowserRegression",
  component: Select,
  tags: ["test"],
  parameters: { layout: "centered" }
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TriggerToggle: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <TriggerToggleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Trigger toggle" });
    const transitions = canvas.getByLabelText("Open transitions");

    await userEvent.click(trigger);
    await expect(await body.findByRole("textbox")).toHaveFocus();
    await userEvent.click(trigger);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(transitions).toHaveTextContent("true,false");
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    const listbox = await body.findByRole("listbox");
    listbox.focus();
    await expect(listbox).toHaveFocus();
    await userEvent.click(trigger);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(transitions).toHaveTextContent("true,false,true,false");

    await userEvent.click(trigger);
    const outside = canvas.getByRole("button", { name: "Outside target" });
    await userEvent.click(outside);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(outside).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(transitions).toHaveTextContent(
      "true,false,true,false,true,false,true,false"
    );
  }
};

export const TriggerHitRegion: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <SelectTriggerHitRegionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Hit region Select" });
    const transitions = canvas.getByLabelText("Hit region Select transitions");
    const valueOutput = canvas.getByLabelText("Hit region Select value");
    const valueText = trigger.querySelector<HTMLElement>("[data-control-text]");
    const chevron = trigger.querySelector<HTMLElement>("[data-select-chevron]");
    if (!valueText || !chevron) throw new Error("Select trigger anatomy is incomplete.");
    await expect(trigger).toHaveAttribute("data-select-trigger");
    await expect(chevron).toHaveAttribute("aria-hidden", "true");
    expect(trigger.querySelector("button")).toBeNull();

    const clear = canvas.getByRole("button", { name: "Очистить выбор" });
    await expect(clear).toHaveAttribute("data-select-clear");
    await userEvent.click(clear);
    await expect(valueOutput).toHaveTextContent("null");
    await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
    expect(transitions.textContent).toBe("");

    await userEvent.click(canvas.getByRole("button", { name: "Reset Select value" }));
    await userEvent.click(valueText);
    await expect(await body.findByRole("textbox")).toHaveFocus();
    await expect(transitions).toHaveTextContent("true");
    await userEvent.click(canvas.getByRole("button", { name: "Очистить выбор" }));
    await expect(valueOutput).toHaveTextContent("null");
    await expect(body.getByRole("listbox")).toBeInTheDocument();
    await expect(transitions).toHaveTextContent("true");
    await userEvent.click(chevron);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(transitions).toHaveTextContent("true,false");

    await userEvent.click(canvas.getByRole("button", { name: "Reset Select value" }));
    await userEvent.click(chevron);
    await expect(await body.findByRole("textbox")).toHaveFocus();
    await userEvent.click(chevron);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(transitions).toHaveTextContent("true,false,true,false");

    await userEvent.click(valueText);
    await body.findByRole("listbox");
    await userEvent.click(valueText);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(transitions).toHaveTextContent("true,false,true,false,true,false");

    await userEvent.click(valueText);
    const search = await body.findByRole("textbox");
    await expect(search).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(body.getByRole("listbox")).toHaveFocus();
    await userEvent.click(chevron);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(transitions).toHaveTextContent(
      "true,false,true,false,true,false,true,false"
    );

    const refreshingTrigger = canvas.getByRole("button", {
      name: "Refreshing hit region Select"
    });
    const spinner = refreshingTrigger.querySelector<HTMLElement>("[data-select-spinner]");
    const refreshingChevron = refreshingTrigger.querySelector<HTMLElement>(
      "[data-select-chevron]"
    );
    if (!spinner || !refreshingChevron) {
      throw new Error("Refreshing trigger status is incomplete.");
    }
    await expect(refreshingTrigger).toHaveAttribute("aria-busy", "true");
    await expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(spinner.tabIndex).toBe(-1);
    await userEvent.click(spinner);
    await expect(await body.findByRole("listbox")).toBeInTheDocument();
    await userEvent.click(refreshingChevron);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(canvas.getByLabelText("Refreshing Select transitions"))
      .toHaveTextContent("true,false");

    const placeholderTrigger = canvas.getByRole("button", {
      name: "Placeholder hit region Select"
    });
    const placeholder = placeholderTrigger.querySelector<HTMLElement>(
      "[data-field-placeholder]"
    );
    const placeholderChevron = placeholderTrigger.querySelector<HTMLElement>(
      "[data-select-chevron]"
    );
    if (!placeholder || !placeholderChevron) {
      throw new Error("Placeholder trigger anatomy is incomplete.");
    }
    await userEvent.click(placeholder);
    await expect(await body.findByRole("listbox")).toBeInTheDocument();
    await userEvent.click(placeholderChevron);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
  }
};

export const MultiSelectTriggerHitRegion: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <MultiSelectTriggerHitRegionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const summaryTrigger = canvas.getByRole("button", {
      name: "Summary hit region MultiSelect"
    });
    const summaryTransitions = canvas.getByLabelText("Summary MultiSelect transitions");
    const placeholder = summaryTrigger.closest("[data-field-part=\"shell\"]")
      ?.querySelector<HTMLElement>("[data-field-placeholder]");
    const summaryChevron = summaryTrigger.querySelector<HTMLElement>(
      "[data-multiselect-chevron]"
    );
    if (!placeholder || !summaryChevron) {
      throw new Error("MultiSelect placeholder anatomy is incomplete.");
    }
    await expect(summaryTrigger).toHaveAttribute("data-multiselect-trigger");
    expect(summaryTrigger.querySelector("button")).toBeNull();
    await userEvent.click(resolveVisualHitTarget(placeholder, summaryTrigger));
    await expect(await body.findByRole("listbox")).toBeInTheDocument();
    await userEvent.click(summaryChevron);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(summaryTransitions).toHaveTextContent("true,false");

    await userEvent.click(canvas.getByRole("button", { name: "Set summary values" }));
    const summary = summaryTrigger.closest("[data-field-part=\"shell\"]")
      ?.querySelector<HTMLElement>("[data-field-selection-presentation=\"summary\"]");
    if (!summary) throw new Error("MultiSelect summary was not rendered.");
    await userEvent.click(resolveVisualHitTarget(summary, summaryTrigger));
    await expect(await body.findByRole("listbox")).toBeInTheDocument();
    await userEvent.click(summaryChevron);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(summaryTransitions).toHaveTextContent("true,false,true,false");

    const chipsTrigger = canvas.getByRole("button", {
      name: "Chips hit region MultiSelect"
    });
    const chipsShell = chipsTrigger.closest("[data-field-part=\"shell\"]");
    const chipsTransitions = canvas.getByLabelText("Chips MultiSelect transitions");
    const chipsValue = canvas.getByLabelText("Chips MultiSelect value");
    const clearClosed = canvas.getByRole("button", { name: "Очистить выбор" });
    await expect(clearClosed).toHaveAttribute("data-multiselect-clear");
    await userEvent.click(clearClosed);
    expect(chipsValue.textContent).toBe("");
    expect(chipsTransitions.textContent).toBe("");
    await expect(body.queryByRole("listbox")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Reset chip values" }));
    const firstRemove = canvas.getByRole("button", { name: "Убрать Альфа" });
    await expect(firstRemove).toHaveAttribute("data-field-chip-remove");
    await userEvent.click(firstRemove);
    await expect(chipsValue).toHaveTextContent("beta");
    expect(chipsTransitions.textContent).toBe("");
    await expect(body.queryByRole("listbox")).not.toBeInTheDocument();

    const chipBody = chipsShell?.querySelector<HTMLElement>(
      "[data-field-chip] [data-control-text-clip]"
    );
    const chipsChevron = chipsTrigger.querySelector<HTMLElement>(
      "[data-multiselect-chevron]"
    );
    if (!chipBody || !chipsChevron) throw new Error("MultiSelect chip anatomy is incomplete.");
    await userEvent.click(resolveVisualHitTarget(chipBody, chipsTrigger));
    await expect(await body.findByRole("listbox")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Убрать Бета" }));
    expect(chipsValue.textContent).toBe("");
    await expect(body.getByRole("listbox")).toBeInTheDocument();
    await expect(chipsTransitions).toHaveTextContent("true");
    await userEvent.click(chipsChevron);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(chipsTransitions).toHaveTextContent("true,false");

    await userEvent.click(canvas.getByRole("button", { name: "Reset chip values" }));
    const resetChipBody = chipsShell?.querySelector<HTMLElement>(
      "[data-field-chip] [data-control-text-clip]"
    );
    if (!resetChipBody) throw new Error("Reset MultiSelect chip was not rendered.");
    await userEvent.click(resolveVisualHitTarget(resetChipBody, chipsTrigger));
    await expect(await body.findByRole("listbox")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Очистить выбор" }));
    expect(chipsValue.textContent).toBe("");
    await expect(body.getByRole("listbox")).toBeInTheDocument();
    await expect(chipsTransitions).toHaveTextContent("true,false,true");
    await userEvent.click(chipsChevron);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(chipsTransitions).toHaveTextContent("true,false,true,false");
  }
};

export const LoadingSpinnerHitRegion: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <LoadingSpinnerHitRegionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;

    const verifyLoadingTrigger = async ({
      marker,
      name,
      transitionsLabel
    }: {
      marker: "data-select-trigger" | "data-multiselect-trigger";
      name: string;
      transitionsLabel: string;
    }) => {
      const trigger = canvas.getByRole("button", { name });
      const spinner = trigger.querySelector<HTMLElement>("[data-select-spinner]");
      if (!spinner) throw new Error(`${name} spinner was not rendered.`);
      await expect(trigger).toHaveAttribute(marker);
      await expect(trigger).toHaveAttribute("aria-busy", "true");
      await expect(spinner).toHaveAttribute("aria-hidden", "true");
      await expect(spinner).not.toHaveAttribute("tabindex");

      await userEvent.click(spinner);
      await waitFor(() => expect(document.querySelector("[data-select-surface]"))
        .not.toBeNull());
      await expect(canvas.getByLabelText(transitionsLabel)).toHaveTextContent("true");

      await userEvent.click(spinner);
      await waitFor(() => expect(document.querySelector("[data-select-surface]"))
        .toBeNull());
      await expect(canvas.getByLabelText(transitionsLabel))
        .toHaveTextContent("true,false");
    };

    await verifyLoadingTrigger({
      marker: "data-select-trigger",
      name: "Loading spinner Select",
      transitionsLabel: "Loading Select transitions"
    });
    await verifyLoadingTrigger({
      marker: "data-multiselect-trigger",
      name: "Loading spinner MultiSelect",
      transitionsLabel: "Loading MultiSelect transitions"
    });

    const refreshingMulti = canvas.getByRole("button", {
      name: "Refreshing spinner MultiSelect"
    });
    const refreshingSpinner = refreshingMulti.querySelector<HTMLElement>(
      "[data-select-spinner]"
    );
    const refreshingChevron = refreshingMulti.querySelector<HTMLElement>(
      "[data-multiselect-chevron]"
    );
    if (!refreshingSpinner || !refreshingChevron) {
      throw new Error("Refreshing MultiSelect status is incomplete.");
    }
    await userEvent.click(refreshingSpinner);
    await waitFor(() => expect(document.querySelector("[data-select-surface]"))
      .not.toBeNull());
    await userEvent.click(refreshingChevron);
    await waitFor(() => expect(document.querySelector("[data-select-surface]"))
      .toBeNull());
    await expect(canvas.getByLabelText("Refreshing MultiSelect transitions"))
      .toHaveTextContent("true,false");
  }
};

export const TriggerHitRegionGeometry: Story = {
  args: {} as never,
  render: () => <TriggerHitRegionGeometryFixture />,
  play: async ({ canvasElement }) => {
    const heights = { sm: 32, md: 40, lg: 48 } as const;
    for (const size of ["sm", "md", "lg"] as const) {
      const row = canvasElement.querySelector<HTMLElement>(
        `[data-trigger-geometry-row="${size}"]`
      );
      if (!row) throw new Error(`Missing ${size} trigger geometry row.`);
      const shells = row.querySelectorAll<HTMLElement>("[data-field-part=\"shell\"]");
      expect(shells).toHaveLength(2);
      for (const shell of shells) {
        expect(Math.round(shell.getBoundingClientRect().height)).toBe(heights[size]);
      }
      const selectTrigger = row.querySelector<HTMLElement>("[data-select-trigger]");
      const multiTrigger = row.querySelector<HTMLElement>("[data-multiselect-trigger]");
      if (!selectTrigger || !multiTrigger) throw new Error("Trigger markers are missing.");
      const selectChevron = selectTrigger.querySelector<HTMLElement>(
        "[data-select-chevron]"
      );
      const selectClear = row.querySelector<HTMLElement>("[data-select-clear]");
      const multiClear = row.querySelector<HTMLElement>("[data-multiselect-clear]");
      const valueClip = selectTrigger.querySelector<HTMLElement>(
        "[data-control-text-clip]"
      );
      expect(selectChevron).not.toBeNull();
      expect(selectTrigger.querySelector("[data-select-spinner]")).not.toBeNull();
      expect(multiTrigger.querySelector("[data-multiselect-chevron]")).not.toBeNull();
      expect(selectTrigger.querySelector("button")).toBeNull();
      expect(multiTrigger.querySelector("button")).toBeNull();
      expect(selectClear).not.toBeNull();
      expect(multiClear).not.toBeNull();
      expect(selectTrigger.querySelector("[data-select-clear]")).toBeNull();
      expect(multiTrigger.querySelector("[data-multiselect-clear]")).toBeNull();
      expect(Math.round(selectChevron?.getBoundingClientRect().width ?? 0)).toBe(20);
      expect(valueClip?.scrollWidth).toBeGreaterThan(valueClip?.clientWidth ?? 0);
      expect(selectTrigger.getBoundingClientRect().right)
        .toBeLessThanOrEqual(selectClear?.getBoundingClientRect().left ?? 0);
      expect(multiTrigger.getBoundingClientRect().right)
        .toBeLessThanOrEqual(multiClear?.getBoundingClientRect().left ?? 0);
    }
  }
};

export const UncontrolledTriggerToggle: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <UncontrolledTriggerToggleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", {
      name: "Uncontrolled trigger toggle"
    });

    await userEvent.click(trigger);
    await expect(await body.findByRole("listbox")).toBeInTheDocument();
    await userEvent.click(trigger);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    const outside = canvas.getByRole("button", {
      name: "Uncontrolled outside target"
    });
    await userEvent.click(outside);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(outside).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  }
};

export const CompactBottomSheetPresentation: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <SelectFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Клиент" });

    await userEvent.click(trigger);
    await expect(document.querySelector("[data-modal-kind=\"bottom-sheet\"]"))
      .not.toBeNull();
    await expect(document.querySelector("[data-floating-overlay]"))
      .toBeNull();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(body.getByRole("listbox")).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector("[data-select-surface]"))
      .toBeNull());
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("option", { name: "Вариант 1" }));
    await waitFor(() => expect(document.querySelector("[data-select-surface]"))
      .toBeNull());
    await expect(trigger).toHaveFocus();
  }
};

export const DisabledContract: Story = {
  args: {} as never,
  render: () => <DisabledFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("button", { name: "Disabled Select" });
    const multi = canvas.getByRole("button", { name: "Disabled MultiSelect" });
    await expect(select).toBeDisabled();
    await expect(multi).toBeDisabled();
    await userEvent.click(select);
    await userEvent.click(multi);
    await expect(canvasElement.ownerDocument.querySelector("[data-select-surface]"))
      .toBeNull();
  }
};

export const FieldValueTypographyMatrix: Story = {
  args: {} as never,
  render: () => <FieldValueTypographyFixture />,
  play: async ({ canvasElement }) => {
    for (const row of canvasElement.querySelectorAll<HTMLElement>(
      "[data-field-value-row]"
    )) {
      const expectedRole = row.dataset.expectedRole;
      expect(expectedRole).toBeTruthy();
      const fieldValues = row.querySelectorAll<HTMLElement>(
        "[data-control-text-role^=\"fieldValueText\"]"
      );
      const size = row.dataset.fieldValueRow;
      expect(fieldValues.length).toBe(size === "lg" ? 3 : 4);
      for (const value of fieldValues) {
        expect(value).toHaveAttribute("data-control-text-role", expectedRole);
      }
      for (const chip of row.querySelectorAll<HTMLElement>("[data-field-chip]")) {
        expect(chip.querySelector("[data-control-text-role]"))
          .toHaveAttribute("data-control-text-role", "compactChipText");
      }
    }
  }
};

export const PanelHeightAndScrollOwner: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <SelectFixture searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Клиент" }));

    const surface = canvasElement.ownerDocument.querySelector<HTMLElement>(
      "[data-floating-overlay][data-select-surface]"
    );
    if (!surface) throw new Error("Select popover surface was not rendered.");
    const listbox = await body.findByRole("listbox");
    const owners = surface.querySelectorAll("[data-select-scroll-owner]");
    await expect(owners).toHaveLength(1);
    await expect(owners[0]).toBe(listbox);
    await expect(getComputedStyle(listbox).overflowY).toBe("auto");
    await expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight);
    const view = canvasElement.ownerDocument.defaultView;
    if (!view) throw new Error("Story document has no default view.");
    await expect(surface.getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(view.innerHeight);
  }
};

export const MobileSelectSearchFocus: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <SelectFixture searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Клиент" });
    await userEvent.click(trigger);

    const search = await body.findByRole("textbox", { name: "Поиск по вариантам" });
    await waitFor(() => expect(search).toHaveFocus());
    const sheet = document.querySelector<HTMLElement>(
      "[data-modal-kind=\"bottom-sheet\"]"
    );
    if (!sheet) throw new Error("Select BottomSheet was not rendered.");
    const visualViewport = document.defaultView?.visualViewport;
    if (visualViewport) {
      await waitFor(() => {
        expect(sheet.getBoundingClientRect().bottom)
          .toBeLessThanOrEqual(visualViewport.offsetTop + visualViewport.height);
      });
    }
    const listbox = body.getByRole("listbox");
    await expect(getComputedStyle(listbox).overflowY).toBe("auto");
    await expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight);
    const modalBody = document.querySelector<HTMLElement>(
      "[data-modal-scroll-container]"
    );
    if (!modalBody) throw new Error("BottomSheet scroll container was not rendered.");
    await expect(modalBody.scrollHeight).toBe(modalBody.clientHeight);

    await userEvent.click(body.getByRole("option", { name: "Вариант 1" }));
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await expect(await body.findByRole("textbox", { name: "Поиск по вариантам" }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  }
};

export const MobileMultiSearchFocus: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <MultiFixture searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Теги" });
    await userEvent.click(trigger);

    await expect(await body.findByRole("textbox", { name: "Поиск по вариантам" }))
      .toHaveFocus();
    await userEvent.click(body.getByRole("button", { name: "Готово" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  }
};

export const ReadOnlyContract: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "tablet" } },
  render: () => <ReadOnlyFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    const selectValue = canvas.getByRole("button", { name: "ReadOnly Select value" });
    const selectPlaceholder = canvas.getByRole("button", {
      name: "ReadOnly Select placeholder"
    });
    const multiSummary = canvas.getByRole("button", {
      name: "ReadOnly MultiSelect summary"
    });
    const multiChips = canvas.getByRole("button", {
      name: "ReadOnly MultiSelect chips"
    });
    const triggers = [selectValue, selectPlaceholder, multiSummary, multiChips];
    for (const trigger of triggers) {
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).not.toBeDisabled();
      expect(trigger.tabIndex).toBe(0);
    }
    await expect(canvas.queryByRole("button", { name: "Очистить выбор" }))
      .not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: /Убрать/ }))
      .not.toBeInTheDocument();

    const assertReadOnlyTarget = async (target: HTMLElement, trigger: HTMLElement) => {
      await userEvent.click(target);
      await expect(trigger).toHaveFocus();
      expect(document.querySelector("[data-select-surface]")).toBeNull();
      expect(document.querySelector("[data-modal-kind=\"bottom-sheet\"]"))
        .toBeNull();
    };

    const valueText = selectValue.querySelector<HTMLElement>("[data-control-text]");
    const leading = selectValue.querySelector<HTMLElement>(".lucide-user");
    const valueChevron = selectValue.querySelector<HTMLElement>("[data-select-chevron]");
    const placeholder = selectPlaceholder.querySelector<HTMLElement>(
      "[data-field-placeholder]"
    );
    const placeholderChevron = selectPlaceholder.querySelector<HTMLElement>(
      "[data-select-chevron]"
    );
    if (!valueText || !leading || !valueChevron || !placeholder || !placeholderChevron) {
      throw new Error("Read-only Select target anatomy is incomplete.");
    }
    for (const target of [selectValue, valueText, leading, valueChevron]) {
      await assertReadOnlyTarget(target, selectValue);
    }
    for (const target of [selectPlaceholder, placeholder, placeholderChevron]) {
      await assertReadOnlyTarget(target, selectPlaceholder);
    }

    const summaryShell = multiSummary.closest("[data-field-part=\"shell\"]");
    const summary = summaryShell?.querySelector<HTMLElement>(
      "[data-field-selection-presentation=\"summary\"]"
    );
    const summaryChevron = multiSummary.querySelector<HTMLElement>(
      "[data-multiselect-chevron]"
    );
    const chipsShell = multiChips.closest("[data-field-part=\"shell\"]");
    const chipBody = chipsShell?.querySelector<HTMLElement>(
      "[data-field-chip] [data-control-text-clip]"
    );
    const chipsChevron = multiChips.querySelector<HTMLElement>(
      "[data-multiselect-chevron]"
    );
    if (!summary || !summaryChevron || !chipBody || !chipsChevron) {
      throw new Error("Read-only MultiSelect target anatomy is incomplete.");
    }
    await assertReadOnlyTarget(
      resolveVisualHitTarget(summary, multiSummary),
      multiSummary
    );
    await assertReadOnlyTarget(summaryChevron, multiSummary);
    await assertReadOnlyTarget(multiSummary, multiSummary);
    await assertReadOnlyTarget(
      resolveVisualHitTarget(chipBody, multiChips),
      multiChips
    );
    await assertReadOnlyTarget(chipsChevron, multiChips);
    await assertReadOnlyTarget(multiChips, multiChips);

    await expect(canvas.getByLabelText("ReadOnly values"))
      .toHaveTextContent("alpha|null|alpha,beta|alpha,beta");
    expect(canvas.getByLabelText("ReadOnly transitions").textContent).toBe("");
  }
};

export const MultiSelectWidthStability: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <WidthFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = canvas.getByRole("button", { name: "Stable width" })
      .closest<HTMLElement>("[data-field-part=\"shell\"]");
    if (!shell) throw new Error("MultiSelect FieldShell was not rendered.");
    const initialWidth = shell.getBoundingClientRect().width;
    await expect(initialWidth).toBe(240);
    await userEvent.click(canvas.getByRole("button", { name: "Select 20" }));
    await waitFor(() => expect(shell.getBoundingClientRect().width).toBe(initialWidth));
    await expect(shell.querySelector("[data-measure-tag]")).not.toBeNull();
    await expect(shell.querySelector("[data-field-selection-presentation=\"chips\"]"))
      .not.toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Clear fixture" }));
    await waitFor(() => expect(shell.querySelector("[data-measure-tag]")).toBeNull());
    await expect(shell.getBoundingClientRect().width).toBe(initialWidth);
  }
};

export const VirtualizedMountedActiveDescendant: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <VirtualFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Virtual Select" }));
    const search = await body.findByRole("textbox", { name: "Поиск по вариантам" });
    await userEvent.type(search, "{ArrowDown}");
    const listbox = body.getByRole("listbox");
    await waitFor(() => expect(listbox).toHaveFocus());
    await userEvent.keyboard("{End}");
    await waitFor(() => {
      const activeId = listbox.getAttribute("aria-activedescendant");
      expect(activeId).toBeTruthy();
      expect(canvasElement.ownerDocument.getElementById(activeId as string))
        .not.toBeNull();
    });
    const virtualOwner = listbox.querySelector("[data-select-scroll-owner=\"virtual\"]");
    await expect(virtualOwner).not.toBeNull();
    await expect(listbox.getAttribute("data-select-scroll-owner")).toBeNull();
    await expect(body.queryAllByRole("option").length).toBeLessThan(200);
  }
};

export const HoistedActionToDialog: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <ActionToDialogFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Action Select" });
    await userEvent.click(trigger);
    const action = await body.findByRole("button", { name: "Создать клиента" });
    const listbox = body.getByRole("listbox");
    await expect(listbox.contains(action)).toBe(false);
    await expect(Boolean(
      action.compareDocumentPosition(listbox) & Node.DOCUMENT_POSITION_FOLLOWING
    )).toBe(true);

    await userEvent.click(action);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(await body.findByRole("dialog", { name: "Новый клиент" }))
      .toBeInTheDocument();
    await expect(canvasElement.querySelector("output")).toHaveTextContent("1");
    await expect(trigger).toHaveTextContent("Альфа");
  }
};

export const PopoverSelectInternalFocus: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <SelectActionFocusFixture searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Action focus Select" }));
    const search = await body.findByRole("textbox", { name: "Поиск по вариантам" });
    const action = body.getByRole("button", { name: "Создать клиента" });
    const disabledAction = body.getByRole("button", { name: "Недоступное действие" });
    const listbox = body.getByRole("listbox");
    await waitFor(() => expect(search).toHaveFocus());
    await expect(disabledAction).toBeDisabled();
    await userEvent.tab();
    await waitFor(() => expect(action).toHaveFocus());
    await expect(listbox).toBeInTheDocument();
    await userEvent.tab();
    await expect(listbox).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(action).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(search).toHaveFocus();
    await userEvent.tab();
    await expect(action).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(canvas.getByLabelText("Select action calls")).toHaveTextContent("1");
    await expect(canvas.getByLabelText("Select value")).toHaveTextContent("alpha");
  }
};

export const SheetSelectActionKeyboard: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <SelectActionFocusFixture searchable={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Action focus Select" }));
    const action = await body.findByRole("button", { name: "Создать клиента" });
    await expect(action).toHaveFocus();
    await expect(body.getByRole("button", { name: "Недоступное действие" }))
      .toBeDisabled();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(canvas.getByLabelText("Select action calls")).toHaveTextContent("1");
    await expect(canvas.getByLabelText("Select value")).toHaveTextContent("alpha");
  }
};

export const PopoverMultiSelectActionKeyboard: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "tablet" } },
  render: () => <MultiActionFocusFixture searchable={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Action focus MultiSelect" }));
    const action = await body.findByRole("button", { name: "Создать тег" });
    await waitFor(() => expect(action).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(canvas.getByLabelText("MultiSelect action calls")).toHaveTextContent("1");
    await expect(canvas.getByLabelText("MultiSelect value")).toHaveTextContent("alpha");
  }
};

export const SheetMultiSelectInternalFocus: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <MultiActionFocusFixture searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Action focus MultiSelect" }));
    const search = await body.findByRole("textbox", { name: "Поиск по вариантам" });
    const action = body.getByRole("button", { name: "Создать тег" });
    const listbox = body.getByRole("listbox");
    await expect(search).toHaveFocus();
    await userEvent.tab();
    await expect(action).toHaveFocus();
    await userEvent.tab();
    await expect(listbox).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(action).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(search).toHaveFocus();
    await expect(listbox).toBeInTheDocument();
  }
};

export const GroupedLargeSelectSemantics: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <GroupedLargeFixture multiple={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Grouped Select" }));
    const listbox = await body.findByRole("listbox");
    await expect(listbox).not.toHaveAttribute("data-select-virtualized");
    await expect(within(listbox).getAllByRole("group")).toHaveLength(6);
    await expect(listbox.querySelectorAll("[data-select-scroll-owner]")).toHaveLength(0);
    await expect(listbox).toHaveAttribute("data-select-scroll-owner", "listbox");
  }
};

export const GroupedLargeMultiSelectSemantics: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "tablet" } },
  render: () => <GroupedLargeFixture multiple />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Grouped MultiSelect" }));
    const listbox = await body.findByRole("listbox");
    await expect(listbox).not.toHaveAttribute("data-select-virtualized");
    await expect(within(listbox).getAllByRole("group")).toHaveLength(6);
    await expect(listbox).toHaveAttribute("data-select-scroll-owner", "listbox");
  }
};

export const PopoverClosesOnActualFocusExit: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <SelectFixture searchable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Клиент" }));
    const search = await body.findByRole("textbox", { name: "Поиск по вариантам" });
    const listbox = body.getByRole("listbox");
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.tab();
    await expect(listbox).toHaveFocus();
    await expect(listbox).toBeInTheDocument();
    await userEvent.tab();
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
  }
};

export const AllDisabledActionsInitialListboxFocus: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "tablet" } },
  render: () => <SelectActionFocusFixture allActionsDisabled searchable={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Action focus Select" }));
    const disabledAction = await body.findByRole("button", {
      name: "Недоступное действие"
    });
    const listbox = body.getByRole("listbox");
    await expect(disabledAction).toBeDisabled();
    await waitFor(() => expect(listbox).toHaveFocus());
    await userEvent.click(disabledAction);
    await expect(canvas.getByLabelText("Select action calls")).toHaveTextContent("0");
    await expect(listbox).toBeInTheDocument();
  }
};
