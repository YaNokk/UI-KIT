import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { User } from "lucide-react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { Dialog } from "../../Dialog/Dialog";
import { DesignSystemProvider } from "../../DesignSystemProvider/DesignSystemProvider";
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

const thresholdCounts = [201, 499, 500, 501] as const;
const thresholdItems = new Map(thresholdCounts.map((count) => [
  count,
  Array.from({ length: count }, (_, index) => ({
    value: `threshold-${count}-${index}`,
    label: `Граница ${count}, вариант ${index + 1}`,
    textValue: `Граница ${count}, вариант ${index + 1}`
  })) satisfies SelectCollectionItem[]
]));

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

function VirtualizationThresholdFixture() {
  const [values, setValues] = useState<Record<number, string | null>>({});
  return (
    <div className={styles.stack}>
      {thresholdCounts.map((count) => (
        <Select
          items={thresholdItems.get(count) ?? []}
          key={count}
          label={`Threshold ${count}`}
          locale="ru-RU"
          onChange={(value) => setValues((current) => ({ ...current, [count]: value }))}
          value={values[count] ?? null}
        />
      ))}
    </div>
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

const indicatorItems: SelectCollectionItem[] = [
  {
    value: "alpha",
    label: "Альфа",
    description: "Описание выбранного варианта",
    textValue: "Альфа"
  },
  {
    value: "beta",
    label: "Бета",
    description: "Описание невыбранного варианта",
    textValue: "Бета"
  },
  {
    value: "disabled",
    label: "Недоступный вариант",
    textValue: "Недоступный вариант",
    disabled: true
  },
  {
    value: "long",
    label: "Очень длинный вариант, который переносится и сохраняет выравнивание индикатора по первой строке",
    textValue: "Очень длинный вариант"
  },
  {
    type: "action",
    id: "create-indicator-item",
    label: "Создать вариант",
    textValue: "Создать вариант",
    onSelect: () => undefined
  }
];

function MultiSelectChoiceIndicatorFixture({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [value, setValue] = useState<string[]>(["alpha", "disabled"]);
  const [changes, setChanges] = useState(0);
  return (
    <div className={styles.width320}>
      <MultiSelect
        block
        items={indicatorItems}
        label={`ChoiceIndicator ${size}`}
        onChange={(nextValue) => {
          setChanges((count) => count + 1);
          setValue(nextValue);
        }}
        open
        size={size}
        value={value}
      />
      <output aria-label="ChoiceIndicator changes">{changes}</output>
    </div>
  );
}

function MultiSelectChoiceIndicatorSizeFixture() {
  const [size, setSize] = useState<"sm" | "md" | "lg">("sm");
  return (
    <div className={styles.stack}>
      <button
        onClick={() => setSize((current) => current === "sm" ? "md" : current === "md" ? "lg" : "sm")}
        type="button"
      >
        Toggle indicator size
      </button>
      <MultiSelectChoiceIndicatorFixture size={size} />
    </div>
  );
}

// eslint-disable-next-line design-system/no-design-literals -- Deliberate runtime-brand contrast fixtures.
const integrationBrands = ["#0080ff", "#facc15", "#86efac", "#003366", "#7c3aed"] as const;

function MultiSelectChoiceIndicatorBrandFixture() {
  const [brandIndex, setBrandIndex] = useState(0);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const accentColor = integrationBrands[brandIndex] ?? integrationBrands[0];
  return (
    <DesignSystemProvider brand={{ accentColor }} mode={mode}>
      <div className={styles.stack}>
        <button
          onClick={() => setBrandIndex((index) => (index + 1) % integrationBrands.length)}
          type="button"
        >Next integration brand</button>
        <button onClick={() => setMode((value) => value === "light" ? "dark" : "light")} type="button">
          Toggle integration mode
        </button>
        <output aria-label="Integration brand state">{`${brandIndex}:${mode}`}</output>
        <span aria-hidden="true" className={styles.primaryColorProbe} data-primary-color-probe="" />
        <MultiSelectChoiceIndicatorFixture />
      </div>
    </DesignSystemProvider>
  );
}

function VirtualMultiSelectChoiceIndicatorFixture() {
  const [value, setValue] = useState<string[]>(["virtual-0"]);
  return (
    <MultiSelect
      block
      items={virtualItems}
      label="Virtual ChoiceIndicator MultiSelect"
      onChange={setValue}
      open
      searchable
      value={value}
    />
  );
}

function SelectNarrowPopupFixture() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className={styles.width320} data-narrow-select="">
      <Select
        block
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
        label="Narrow Select"
        labelView="inner"
        onChange={setValue}
        placeholder="Выберите значение"
        value={value}
      />
    </div>
  );
}

function MultiSelectNarrowPopupFixture() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className={styles.width320} data-narrow-multiselect="">
      <MultiSelect
        block
        clearable
        items={baseItems}
        label="Narrow MultiSelect"
        labelView="inner"
        onChange={setValue}
        placeholder="Выберите значения"
        value={value}
      />
    </div>
  );
}

const transitionItems: SelectCollectionItem[] = [
  {
    value: "alpha",
    label: "Alpha",
    textValue: "Alpha",
    leading: <User aria-label="Customer icon" role="img" />
  },
  { value: "beta", label: "Beta", textValue: "Beta" }
];

type AddonTransitionStatus = "ready" | "refreshing" | "loading";

function nextAddonTransitionStatus(status: AddonTransitionStatus): AddonTransitionStatus {
  if (status === "ready") return "refreshing";
  if (status === "refreshing") return "loading";
  return "ready";
}

function SelectNarrowAddonTransitionsFixture() {
  const [status, setStatus] = useState<AddonTransitionStatus>("ready");
  const [value, setValue] = useState<string | null>("alpha");
  return (
    <div className={styles.width320} data-select-addon-transitions="">
      <Select
        block
        clearable
        collectionState={{ status }}
        items={transitionItems}
        label="Select addon transitions"
        labelView="inner"
        onChange={setValue}
        placeholder="Choose a value"
        value={value}
      />
      <button
        onClick={() => setStatus(nextAddonTransitionStatus)}
        type="button"
      >Cycle Select status</button>
      <button
        onClick={() => setValue((current) => current === null ? "alpha" : null)}
        type="button"
      >Toggle Select value</button>
      <output aria-label="Select transition status">
        {`${status}:${value ?? "empty"}`}
      </output>
    </div>
  );
}

function MultiSelectNarrowAddonTransitionsFixture() {
  const [status, setStatus] = useState<AddonTransitionStatus>("ready");
  const [value, setValue] = useState<string[]>(["beta"]);
  return (
    <div className={styles.width320} data-multiselect-addon-transitions="">
      <MultiSelect
        block
        clearable
        collectionState={{ status }}
        items={transitionItems}
        label="MultiSelect addon transitions"
        labelView="outer"
        onChange={setValue}
        placeholder="Choose values"
        value={value}
      />
      <button
        onClick={() => setStatus(nextAddonTransitionStatus)}
        type="button"
      >Cycle MultiSelect status</button>
      <button
        onClick={() => setValue((current) => current.length === 0 ? ["beta"] : [])}
        type="button"
      >Toggle MultiSelect value</button>
      <output aria-label="MultiSelect transition status">
        {`${status}:${value.length === 0 ? "empty" : "selected"}`}
      </output>
    </div>
  );
}

function SelectLeadingAccessibilityIsolationFixture() {
  const namedLeadingItem: SelectCollectionItem = {
    value: "alpha",
    label: "Alpha",
    textValue: "Alpha",
    leading: <User aria-label="Customer icon" role="img" />
  };
  return (
    <div className={styles.stack}>
      <Select
        items={[namedLeadingItem]}
        label="Selected outer naming"
        onChange={() => undefined}
        value="alpha"
      />
      <Select
        items={[namedLeadingItem]}
        label="Selected inner naming"
        labelView="inner"
        onChange={() => undefined}
        value="alpha"
      />
      <Select
        items={[namedLeadingItem]}
        label="Placeholder outer naming"
        onChange={() => undefined}
        placeholder="Choose a customer"
        value={null}
      />
      <Select
        items={[namedLeadingItem]}
        label="Read only inner naming"
        labelView="inner"
        onChange={() => undefined}
        readOnly
        value="alpha"
      />
    </div>
  );
}

function TagRemoveContainmentFixture() {
  const [value, setValue] = useState<string[]>(["alpha", "beta"]);
  const [changes, setChanges] = useState(0);
  return (
    <div className={styles.width320}>
      <MultiSelect
        block
        items={baseItems}
        label="Tag remove containment"
        locale="ru-RU"
        onChange={(nextValue) => {
          setChanges((count) => count + 1);
          setValue(nextValue);
        }}
        value={value}
      />
      <output aria-label="Tag remove changes">{changes}</output>
    </div>
  );
}

function InnerLabelAddonIsolationFixture() {
  const items: SelectCollectionItem[] = [{
    value: "alpha",
    label: "Альфа",
    textValue: "Альфа",
    leading: <User aria-hidden="true" />
  }];
  return (
    <div className={styles.stack}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div data-addon-isolation-size={size} key={size}>
          {(["outer", "inner"] as const).map((labelView) => (
            <div data-addon-isolation-view={labelView} key={labelView}>
              <Select
                clearable
                collectionState={{ status: "refreshing" }}
                items={items}
                label={`Select ${size} ${labelView}`}
                labelView={labelView}
                onChange={() => undefined}
                size={size}
                value="alpha"
              />
              <MultiSelect
                clearable
                collectionState={{ status: "refreshing" }}
                items={items}
                label={`MultiSelect ${size} ${labelView}`}
                labelView={labelView}
                onChange={() => undefined}
                size={size}
                value={["alpha"]}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function choiceIndicatorFor(option: HTMLElement): HTMLElement {
  const indicator = option.querySelector<HTMLElement>(
    ':scope > [data-kind="checkbox"][aria-hidden="true"]'
  );
  if (!indicator) throw new Error("MultiSelect ChoiceIndicator was not rendered.");
  return indicator;
}

function expectChoiceIndicatorGeometry(indicator: HTMLElement, size: number) {
  const indicatorRect = indicator.getBoundingClientRect();
  expect(indicatorRect.width).toBe(size);
  expect(indicatorRect.height).toBe(size);
  const mark = indicator.querySelector("svg");
  if (!(mark instanceof SVGElement)) throw new Error("ChoiceIndicator checkmark was not rendered.");
  if (getComputedStyle(mark).display === "none") return;
  const markRect = mark.getBoundingClientRect();
  expect(markRect.left).toBeGreaterThanOrEqual(indicatorRect.left);
  expect(markRect.top).toBeGreaterThanOrEqual(indicatorRect.top);
  expect(markRect.right).toBeLessThanOrEqual(indicatorRect.right);
  expect(markRect.bottom).toBeLessThanOrEqual(indicatorRect.bottom);
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

function fieldShellFor(trigger: HTMLElement) {
  const shell = trigger.closest<HTMLElement>("[data-field-part=\"shell\"]");
  if (!shell) throw new Error("Select trigger FieldShell was not rendered.");
  return shell;
}

function expectPopupMatchesShell(trigger: HTMLElement, surface: HTMLElement) {
  const shellRect = fieldShellFor(trigger).getBoundingClientRect();
  const surfaceRect = surface.getBoundingClientRect();
  expect(Math.abs(surfaceRect.width - shellRect.width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(surfaceRect.left - shellRect.left)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(surfaceRect.right - shellRect.right)).toBeLessThanOrEqual(0.5);
  expect(surfaceRect.left).toBeGreaterThanOrEqual(0);
  expect(surfaceRect.right).toBeLessThanOrEqual(trigger.ownerDocument.defaultView?.innerWidth ?? 0);
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
    await body.findByRole("textbox");
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
    const chevron = fieldShellFor(trigger).querySelector<HTMLElement>(
      "[data-select-chevron]"
    );
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
    const refreshingShell = fieldShellFor(refreshingTrigger);
    const spinner = refreshingShell.querySelector<HTMLElement>("[data-select-spinner]");
    const refreshingChevron = refreshingShell.querySelector<HTMLElement>(
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
    const placeholderChevron = fieldShellFor(placeholderTrigger).querySelector<HTMLElement>(
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
    const summaryChevron = fieldShellFor(summaryTrigger).querySelector<HTMLElement>(
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
    const chipsChevron = fieldShellFor(chipsTrigger).querySelector<HTMLElement>(
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
      const spinner = fieldShellFor(trigger).querySelector<HTMLElement>(
        "[data-select-spinner]"
      );
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
    const refreshingShell = fieldShellFor(refreshingMulti);
    const refreshingSpinner = refreshingShell.querySelector<HTMLElement>(
      "[data-select-spinner]"
    );
    const refreshingChevron = refreshingShell.querySelector<HTMLElement>(
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
      const selectChevron = fieldShellFor(selectTrigger).querySelector<HTMLElement>(
        "[data-select-chevron]"
      );
      const selectClear = row.querySelector<HTMLElement>("[data-select-clear]");
      const multiClear = row.querySelector<HTMLElement>("[data-multiselect-clear]");
      const valueClip = selectTrigger.querySelector<HTMLElement>(
        "[data-control-text-clip]"
      );
      expect(selectChevron).not.toBeNull();
      expect(fieldShellFor(selectTrigger).querySelector("[data-select-spinner]"))
        .not.toBeNull();
      expect(fieldShellFor(multiTrigger).querySelector("[data-multiselect-chevron]"))
        .not.toBeNull();
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
    const leading = fieldShellFor(selectValue).querySelector<HTMLElement>(".lucide-user");
    const valueChevron = fieldShellFor(selectValue).querySelector<HTMLElement>(
      "[data-select-chevron]"
    );
    const placeholder = selectPlaceholder.querySelector<HTMLElement>(
      "[data-field-placeholder]"
    );
    const placeholderChevron = fieldShellFor(selectPlaceholder).querySelector<HTMLElement>(
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
    const summaryChevron = fieldShellFor(multiSummary).querySelector<HTMLElement>(
      "[data-multiselect-chevron]"
    );
    const chipsShell = multiChips.closest("[data-field-part=\"shell\"]");
    const chipBody = chipsShell?.querySelector<HTMLElement>(
      "[data-field-chip] [data-control-text-clip]"
    );
    const chipsChevron = fieldShellFor(multiChips).querySelector<HTMLElement>(
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

export const TagRemoveContainment: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <TagRemoveContainmentFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvasElement.querySelector<HTMLElement>("[data-field-chip]");
    const remove = canvas.getByRole("button", { name: "Убрать Альфа" });
    if (!chip) throw new Error("MultiSelect chip was not rendered.");

    const assertContainedAndStable = (expected: DOMRect) => {
      const chipRect = chip.getBoundingClientRect();
      const removeRect = remove.getBoundingClientRect();
      expect(Math.abs(chipRect.width - expected.width)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(chipRect.height - expected.height)).toBeLessThanOrEqual(0.5);
      expect(removeRect.left).toBeGreaterThanOrEqual(chipRect.left);
      expect(removeRect.top).toBeGreaterThanOrEqual(chipRect.top);
      expect(removeRect.right).toBeLessThanOrEqual(chipRect.right);
      expect(removeRect.bottom).toBeLessThanOrEqual(chipRect.bottom);
    };

    const initialRect = chip.getBoundingClientRect();
    assertContainedAndStable(initialRect);
    await userEvent.hover(remove);
    assertContainedAndStable(initialRect);
    await userEvent.click(remove);
    await expect(canvas.getByLabelText("Tag remove changes")).toHaveTextContent("1");

    canvasElement.style.zoom = "1.25";
    const zoomedChip = canvasElement.querySelector<HTMLElement>("[data-field-chip]");
    const zoomedRemove = canvas.getByRole("button", { name: "Убрать Бета" });
    if (!zoomedChip) throw new Error("Zoomed MultiSelect chip was not rendered.");
    const chipRect = zoomedChip.getBoundingClientRect();
    const removeRect = zoomedRemove.getBoundingClientRect();
    expect(removeRect.left).toBeGreaterThanOrEqual(chipRect.left);
    expect(removeRect.top).toBeGreaterThanOrEqual(chipRect.top);
    expect(removeRect.right).toBeLessThanOrEqual(chipRect.right);
    expect(removeRect.bottom).toBeLessThanOrEqual(chipRect.bottom);
    canvasElement.style.zoom = "";
  }
};

export const TagRemoveHoverActive = TagRemoveContainment;

// Genuine :active capture is covered by SelectTagRemoveStateCapture.browser.test.tsx.
export const TagRemoveRealHoverActive = TagRemoveContainment;

export const SelectLeadingAccessibilityIsolation: Story = {
  args: {} as never,
  render: () => <SelectLeadingAccessibilityIsolationFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of [
      "Selected outer naming",
      "Selected inner naming",
      "Placeholder outer naming",
      "Read only inner naming"
    ]) {
      await expect(canvas.getByRole("button", { name })).toHaveAccessibleName(name);
    }
    const selectedTriggers = [
      canvas.getByRole("button", { name: "Selected outer naming" }),
      canvas.getByRole("button", { name: "Selected inner naming" }),
      canvas.getByRole("button", { name: "Read only inner naming" })
    ];
    for (const trigger of selectedTriggers) {
      const leading = fieldShellFor(trigger).querySelector(
        "[data-field-part=\"start-adornment\"] > [aria-hidden=\"true\"]"
      );
      expect(leading).not.toBeNull();
    }
    expect(canvas.queryByRole("img", { name: "Customer icon" })).toBeNull();
  }
};

export const SelectNarrow320PopupWidth: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <SelectNarrowPopupFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Narrow Select" });
    expect(Math.abs(fieldShellFor(trigger).getBoundingClientRect().width - 320))
      .toBeLessThanOrEqual(0.5);

    await userEvent.click(trigger);
    let surface = (await body.findByRole("listbox")).closest<HTMLElement>(
      "[data-select-surface]"
    );
    if (!surface) throw new Error("Select popover surface was not rendered.");
    expectPopupMatchesShell(trigger, surface);

    await userEvent.click(body.getByRole("option", { name: "Альфа" }));
    await userEvent.click(trigger);
    surface = canvasElement.ownerDocument.querySelector<HTMLElement>("[data-select-surface]");
    if (!surface) throw new Error("Selected Select popover surface was not rendered.");
    expect(fieldShellFor(trigger).querySelector("[data-select-clear]")).not.toBeNull();
    expect(fieldShellFor(trigger).querySelector("[data-field-part=\"start-adornment\"]"))
      .not.toBeNull();
    expectPopupMatchesShell(trigger, surface);
  }
};

export const PopoverReferenceWidth = SelectNarrow320PopupWidth;

export const MultiSelectNarrow320PopupWidth: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <MultiSelectNarrowPopupFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Narrow MultiSelect" });
    const shell = fieldShellFor(trigger);
    const initialWidth = shell.getBoundingClientRect().width;
    expect(Math.abs(initialWidth - 320)).toBeLessThanOrEqual(0.5);
    await userEvent.click(trigger);
    const surface = await body.findByRole("listbox").then((listbox) =>
      listbox.closest<HTMLElement>("[data-select-surface]")
    );
    if (!surface) throw new Error("MultiSelect popover surface was not rendered.");
    expectPopupMatchesShell(trigger, surface);
    await userEvent.click(body.getByRole("option", { name: "Альфа" }));
    await waitFor(() => expect(shell.querySelector("[data-multiselect-clear]")).not.toBeNull());
    expect(shell.getBoundingClientRect().width).toBe(initialWidth);
    expectPopupMatchesShell(trigger, surface);
  }
};

export const Narrow320AddonTransitions = MultiSelectNarrow320PopupWidth;

export const SelectNarrow320AddonTransitions: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <SelectNarrowAddonTransitionsFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Select addon transitions" });
    const shell = fieldShellFor(trigger);
    const initialWidth = shell.getBoundingClientRect().width;
    expect(Math.abs(initialWidth - 320)).toBeLessThanOrEqual(0.5);
    await userEvent.click(trigger);
    const surface = (await body.findByRole("listbox")).closest<HTMLElement>(
      "[data-select-surface]"
    );
    if (!surface) throw new Error("Select transition surface was not rendered.");

    const assertStablePopup = () => {
      expect(fieldShellFor(trigger)).toBe(shell);
      expect(shell.getBoundingClientRect().width).toBe(initialWidth);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expectPopupMatchesShell(trigger, surface);
    };
    assertStablePopup();
    expect(shell.querySelector("[data-field-part=\"start-adornment\"]"))
      .not.toBeNull();
    expect(shell.querySelector("[data-select-clear]")).not.toBeNull();
    expect(shell.querySelector("[data-select-chevron]")).not.toBeNull();

    fireEvent.click(canvas.getByRole("button", { name: "Cycle Select status" }));
    await waitFor(() => expect(canvas.getByLabelText("Select transition status"))
      .toHaveTextContent("refreshing:alpha"));
    expect(shell.querySelector("[data-select-spinner]")).not.toBeNull();
    expect(shell.querySelector("[data-select-clear]")).not.toBeNull();
    expect(shell.querySelector("[data-select-chevron]")).not.toBeNull();
    assertStablePopup();

    fireEvent.click(canvas.getByRole("button", { name: "Cycle Select status" }));
    await waitFor(() => expect(canvas.getByLabelText("Select transition status"))
      .toHaveTextContent("loading:alpha"));
    expect(shell.querySelector("[data-select-spinner]")).not.toBeNull();
    expect(shell.querySelector("[data-select-clear]")).toBeNull();
    expect(shell.querySelector("[data-select-chevron]")).toBeNull();
    assertStablePopup();

    fireEvent.click(canvas.getByRole("button", { name: "Cycle Select status" }));
    fireEvent.click(canvas.getByRole("button", { name: "Toggle Select value" }));
    await waitFor(() => expect(canvas.getByLabelText("Select transition status"))
      .toHaveTextContent("ready:empty"));
    expect(shell.querySelector("[data-field-part=\"start-adornment\"]")).toBeNull();
    expect(shell.querySelector("[data-select-clear]")).toBeNull();
    assertStablePopup();

    fireEvent.click(canvas.getByRole("button", { name: "Cycle Select status" }));
    await waitFor(() => expect(canvas.getByLabelText("Select transition status"))
      .toHaveTextContent("refreshing:empty"));
    expect(shell.querySelector("[data-select-spinner]")).not.toBeNull();
    assertStablePopup();
    fireEvent.click(canvas.getByRole("button", { name: "Cycle Select status" }));
    await waitFor(() => expect(canvas.getByLabelText("Select transition status"))
      .toHaveTextContent("loading:empty"));
    expect(shell.querySelector("[data-select-spinner]")).not.toBeNull();
    assertStablePopup();
  }
};

export const MultiSelectNarrow320AddonTransitions: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <MultiSelectNarrowAddonTransitionsFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "MultiSelect addon transitions" });
    const shell = fieldShellFor(trigger);
    const initialWidth = shell.getBoundingClientRect().width;
    expect(Math.abs(initialWidth - 320)).toBeLessThanOrEqual(0.5);
    expect(shell.querySelectorAll("[data-field-chip]")).toHaveLength(1);
    await userEvent.click(trigger);
    const surface = (await body.findByRole("listbox")).closest<HTMLElement>(
      "[data-select-surface]"
    );
    if (!surface) throw new Error("MultiSelect transition surface was not rendered.");

    const assertStablePopup = () => {
      expect(fieldShellFor(trigger)).toBe(shell);
      expect(shell.getBoundingClientRect().width).toBe(initialWidth);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expectPopupMatchesShell(trigger, surface);
    };
    assertStablePopup();
    expect(shell.querySelector("[data-field-selection-presentation]"))
      .not.toBeNull();
    expect(shell.querySelector("[data-multiselect-clear]")).not.toBeNull();
    expect(shell.querySelector("[data-multiselect-chevron]")).not.toBeNull();

    fireEvent.click(canvas.getByRole("button", { name: "Cycle MultiSelect status" }));
    await waitFor(() => expect(canvas.getByLabelText("MultiSelect transition status"))
      .toHaveTextContent("refreshing:selected"));
    expect(shell.querySelector("[data-select-spinner]")).not.toBeNull();
    expect(shell.querySelector("[data-multiselect-clear]")).not.toBeNull();
    expect(shell.querySelector("[data-multiselect-chevron]")).not.toBeNull();
    assertStablePopup();

    fireEvent.click(canvas.getByRole("button", { name: "Cycle MultiSelect status" }));
    await waitFor(() => expect(canvas.getByLabelText("MultiSelect transition status"))
      .toHaveTextContent("loading:selected"));
    expect(shell.querySelector("[data-select-spinner]")).not.toBeNull();
    expect(shell.querySelector("[data-multiselect-clear]")).toBeNull();
    expect(shell.querySelector("[data-multiselect-chevron]")).toBeNull();
    assertStablePopup();

    fireEvent.click(canvas.getByRole("button", { name: "Cycle MultiSelect status" }));
    fireEvent.click(canvas.getByRole("button", { name: "Toggle MultiSelect value" }));
    await waitFor(() => expect(canvas.getByLabelText("MultiSelect transition status"))
      .toHaveTextContent("ready:empty"));
    expect(shell.querySelector("[data-field-chip]")).toBeNull();
    expect(shell.querySelector("[data-multiselect-clear]")).toBeNull();
    assertStablePopup();

    fireEvent.click(canvas.getByRole("button", { name: "Cycle MultiSelect status" }));
    await waitFor(() => expect(canvas.getByLabelText("MultiSelect transition status"))
      .toHaveTextContent("refreshing:empty"));
    expect(shell.querySelector("[data-select-spinner]")).not.toBeNull();
    assertStablePopup();
    fireEvent.click(canvas.getByRole("button", { name: "Cycle MultiSelect status" }));
    await waitFor(() => expect(canvas.getByLabelText("MultiSelect transition status"))
      .toHaveTextContent("loading:empty"));
    expect(shell.querySelector("[data-select-spinner]")).not.toBeNull();
    assertStablePopup();
  }
};

export const PopupReferenceLifecycle = SelectNarrow320AddonTransitions;

export const InnerLabelAddonIsolation: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <InnerLabelAddonIsolationFixture />,
  play: async ({ canvasElement }) => {
    const centerY = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return rect.top + rect.height / 2;
    };
    for (const size of ["sm", "md", "lg"] as const) {
      const row = canvasElement.querySelector<HTMLElement>(
        `[data-addon-isolation-size="${size}"]`
      );
      const outer = row?.querySelector<HTMLElement>("[data-addon-isolation-view=\"outer\"]");
      const inner = row?.querySelector<HTMLElement>("[data-addon-isolation-view=\"inner\"]");
      if (!outer || !inner) throw new Error(`Missing ${size} addon isolation row.`);
      const outerShells = outer.querySelectorAll<HTMLElement>("[data-field-part=\"shell\"]");
      const innerShells = inner.querySelectorAll<HTMLElement>("[data-field-part=\"shell\"]");
      expect(outerShells).toHaveLength(2);
      expect(innerShells).toHaveLength(2);
      for (let index = 0; index < outerShells.length; index += 1) {
        const outerShell = outerShells[index];
        const innerShell = innerShells[index];
        if (!outerShell || !innerShell) throw new Error("Addon isolation shell is missing.");
        expect(Math.abs(
          outerShell.getBoundingClientRect().height - innerShell.getBoundingClientRect().height
        )).toBeLessThanOrEqual(0.5);
        for (const selector of [
          ...(index === 0 ? ["[data-field-part=\"start-adornment\"]"] : []),
          "[data-select-spinner]",
          index === 0 ? "[data-select-clear]" : "[data-multiselect-clear]",
          index === 0 ? "[data-select-chevron]" : "[data-multiselect-chevron]"
        ]) {
          const outerAddon = outerShell.querySelector(selector);
          const innerAddon = innerShell.querySelector(selector);
          if (!outerAddon || !innerAddon) throw new Error(`Missing addon ${selector}.`);
          expect(Math.abs(
            (centerY(outerAddon) - outerShell.getBoundingClientRect().top)
            - (centerY(innerAddon) - innerShell.getBoundingClientRect().top)
          )).toBeLessThanOrEqual(0.5);
        }
        const outerEnd = outerShell.querySelector<HTMLElement>(
          "[data-field-part=\"end-adornment\"]"
        );
        const innerEnd = innerShell.querySelector<HTMLElement>(
          "[data-field-part=\"end-adornment\"]"
        );
        if (!outerEnd || !innerEnd) throw new Error("Trailing addon slot is missing.");
        const outerInset = outerShell.getBoundingClientRect().right
          - outerEnd.getBoundingClientRect().right;
        const innerInset = innerShell.getBoundingClientRect().right
          - innerEnd.getBoundingClientRect().right;
        expect(Math.abs(outerInset - innerInset)).toBeLessThanOrEqual(0.5);
      }
    }
  }
};

export const InnerLabelLeadingTrailingMatrix = InnerLabelAddonIsolation;
export const InnerLabelLoadingClearChevron = InnerLabelAddonIsolation;
export const InnerLabelGeometrySmMdLg = InnerLabelAddonIsolation;

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

export const DefaultVirtualizationThresholdBoundary: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <VirtualizationThresholdFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    for (const count of thresholdCounts) {
      const trigger = canvas.getByRole("button", { name: `Threshold ${count}` });
      await userEvent.click(trigger);
      const listbox = await body.findByRole("listbox");
      if (count <= 500) {
        await expect(listbox).not.toHaveAttribute("data-select-virtualized");
        await expect(within(listbox).getAllByRole("option")).toHaveLength(count);
      } else {
        await expect(listbox).toHaveAttribute("data-select-virtualized");
        await expect(within(listbox).getAllByRole("option").length).toBeLessThan(count);
      }
      await userEvent.click(trigger);
      await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
    }
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

export const MultiSelectChoiceIndicatorIntegration: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "tablet" } },
  render: () => <MultiSelectChoiceIndicatorFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const listbox = await body.findByRole("listbox");
    await expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    const options = body.getAllByRole("option");
    await expect(options).toHaveLength(4);
    for (const option of options) {
      const indicator = choiceIndicatorFor(option);
      await expect(indicator).toHaveAttribute("aria-hidden", "true");
      await expect(indicator).not.toHaveAttribute("role");
      await expect(indicator).not.toHaveAttribute("tabindex");
      expect(indicator.querySelector("input, button, [role=checkbox], [tabindex]"))
        .toBeNull();
      expectChoiceIndicatorGeometry(indicator, 20);
    }
    expect(listbox.querySelector("input, [role=checkbox]"))
      .toBeNull();

    const alpha = body.getByRole("option", { name: /^Альфа/ });
    const beta = body.getByRole("option", { name: /^Бета/ });
    const disabled = body.getByRole("option", { name: "Недоступный вариант" });
    const long = body.getByRole("option", { name: /Очень длинный вариант/ });
    const alphaIndicator = choiceIndicatorFor(alpha);
    const betaIndicator = choiceIndicatorFor(beta);
    const disabledIndicator = choiceIndicatorFor(disabled);
    await expect(alpha).toHaveAttribute("aria-selected", "true");
    await expect(alphaIndicator).toHaveAttribute("data-checked");
    await expect(beta).toHaveAttribute("aria-selected", "false");
    await expect(betaIndicator).not.toHaveAttribute("data-checked");
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await expect(disabledIndicator).toHaveAttribute("data-disabled");
    await expect(disabledIndicator).toHaveAttribute("data-checked");

    const alphaHeight = alpha.getBoundingClientRect().height;
    const betaHeight = beta.getBoundingClientRect().height;
    expect(Math.abs(alphaHeight - betaHeight)).toBeLessThanOrEqual(0.5);
    const longLabel = long.querySelector<HTMLElement>("[data-choice-control-label]");
    if (!longLabel) throw new Error("Long option label was not rendered.");
    expect(getComputedStyle(longLabel.closest("span") ?? longLabel).whiteSpace).toBe("normal");
    expect(Math.abs(
      choiceIndicatorFor(long).getBoundingClientRect().top
      - longLabel.getBoundingClientRect().top
    )).toBeLessThanOrEqual(1);

    const action = body.getByRole("button", { name: "Создать вариант" });
    expect(action.querySelector('[data-kind="checkbox"]')).toBeNull();

    await userEvent.click(alphaIndicator);
    await expect(canvas.getByLabelText("ChoiceIndicator changes")).toHaveTextContent("1");
    await expect(alpha).toHaveAttribute("aria-selected", "false");
    await expect(alphaIndicator).not.toHaveAttribute("data-checked");
    expect(alpha.getBoundingClientRect().height).toBe(alphaHeight);

    await userEvent.hover(beta);
    listbox.focus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByLabelText("ChoiceIndicator changes")).toHaveTextContent("2");
    await expect(beta).toHaveAttribute("aria-selected", "true");
    await expect(betaIndicator).toHaveAttribute("data-checked");

    if (matchMedia("(forced-colors: active)").matches) {
      expect(getComputedStyle(betaIndicator).forcedColorAdjust).toBe("none");
      expect(getComputedStyle(betaIndicator).borderWidth).not.toBe("0px");
    }
  }
};

export const MultiSelectChoiceIndicatorSizes: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <MultiSelectChoiceIndicatorSizeFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const expectedSizes = [16, 20, 20];
    for (let index = 0; index < expectedSizes.length; index += 1) {
      const alpha = await body.findByRole("option", { name: /^Альфа/ });
      expectChoiceIndicatorGeometry(choiceIndicatorFor(alpha), expectedSizes[index] ?? 20);
      if (index < expectedSizes.length - 1) {
        await userEvent.click(canvas.getByRole("button", { name: "Toggle indicator size" }));
        await waitFor(() => {
          expect(choiceIndicatorFor(body.getByRole("option", { name: /^Альфа/ }))
            .getBoundingClientRect().width).toBe(expectedSizes[index + 1]);
        });
      }
    }
    canvasElement.style.zoom = "1.25";
    expectChoiceIndicatorGeometry(
      choiceIndicatorFor(body.getByRole("option", { name: /^Альфа/ })),
      25
    );
    canvasElement.style.zoom = "";
  }
};

export const CompactOptionIndicatorSizes = MultiSelectChoiceIndicatorSizes;

export const MultiSelectChoiceIndicatorRuntimeBrands: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <MultiSelectChoiceIndicatorBrandFixture />,
  play: async ({ canvasElement }) => {
    if (matchMedia("(forced-colors: active)").matches) return;
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const assertSemanticColor = async (brandIndex: number, mode: "light" | "dark") => {
      await waitFor(() => expect(canvas.getByLabelText("Integration brand state"))
        .toHaveTextContent(`${brandIndex}:${mode}`));
      const indicator = choiceIndicatorFor(await body.findByRole("option", { name: /^Альфа/ }));
      const probe = canvasElement.querySelector<HTMLElement>("[data-primary-color-probe]");
      if (!probe) throw new Error("Primary semantic color probe was not rendered.");
      await waitFor(() => {
        expect(getComputedStyle(indicator).backgroundColor)
          .toBe(getComputedStyle(probe).backgroundColor);
      });
    };

    for (let index = 0; index < integrationBrands.length; index += 1) {
      await assertSemanticColor(index, "light");
      await userEvent.click(canvas.getByRole("button", { name: "Next integration brand" }));
    }
    await userEvent.click(canvas.getByRole("button", { name: "Toggle integration mode" }));
    for (let index = 0; index < integrationBrands.length; index += 1) {
      await assertSemanticColor(index, "dark");
      await userEvent.click(canvas.getByRole("button", { name: "Next integration brand" }));
    }
  }
};

export const CompactOptionIndicatorStates = MultiSelectChoiceIndicatorIntegration;

export const MultiSelectChoiceIndicatorBottomSheet: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <MultiSelectChoiceIndicatorFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("dialog")).toHaveAttribute(
      "data-modal-kind",
      "bottom-sheet"
    );
    const listbox = body.getByRole("listbox");
    await expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    const alpha = body.getByRole("option", { name: /^Альфа/ });
    const indicator = choiceIndicatorFor(alpha);
    expectChoiceIndicatorGeometry(indicator, 20);
    await userEvent.click(indicator);
    await expect(canvas.getByLabelText("ChoiceIndicator changes")).toHaveTextContent("1");
    await expect(alpha).toHaveAttribute("aria-selected", "false");
  }
};

export const BottomSheetParity = MultiSelectChoiceIndicatorBottomSheet;

export const VirtualizedMultiSelectChoiceIndicator: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: () => <VirtualMultiSelectChoiceIndicatorFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const listbox = await body.findByRole("listbox");
    await expect(listbox).toHaveAttribute("data-select-virtualized");
    const mountedOptions = body.getAllByRole("option");
    expect(mountedOptions.length).toBeGreaterThan(0);
    for (const option of mountedOptions) choiceIndicatorFor(option);
    const first = body.getByRole("option", { name: "Виртуальный вариант 1" });
    const indicator = choiceIndicatorFor(first);
    await expect(first).toHaveAttribute("aria-selected", "true");
    await userEvent.click(indicator);
    await expect(first).toHaveAttribute("aria-selected", "false");
    expectChoiceIndicatorGeometry(indicator, 20);
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
    const groups = within(listbox).getAllByRole("group");
    await expect(groups).toHaveLength(6);
    await expect(listbox).toHaveAttribute("data-select-scroll-owner", "listbox");
    const firstOption = within(listbox).getByRole("option", { name: "Вариант 1.1" });
    const indicator = choiceIndicatorFor(firstOption);
    await expect(firstOption).toHaveAttribute("aria-selected", "false");
    await expect(groups[0]?.firstElementChild?.querySelector('[data-kind="checkbox"]')).toBeNull();
    await userEvent.click(indicator);
    await expect(firstOption).toHaveAttribute("aria-selected", "true");
    await expect(choiceIndicatorFor(firstOption)).toHaveAttribute("data-checked");
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
