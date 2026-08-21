import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import type { SelectCollectionItem } from "../internal/select/collection";
import fixtureStyles from "../internal/select/SelectStories.module.css";
import { MultiSelect, type MultiSelectProps } from "./MultiSelect";

const tagItems: SelectCollectionItem[] = [
  { value: "new", label: "Новый", textValue: "Новый" },
  { value: "priority", label: "Приоритет", textValue: "Приоритет" },
  { value: "delivery", label: "Доставка", textValue: "Доставка" },
  { value: "retail", label: "Розница", textValue: "Розница" },
  { value: "wholesale", label: "Опт", textValue: "Опт" },
  { value: "archived", label: "Архив", textValue: "Архив" }
];

const manyTagItems: SelectCollectionItem[] = Array.from(
  { length: 20 },
  (_, index) => ({
    value: `tag-${index + 1}`,
    label: `Тег ${index + 1}`,
    textValue: `Тег ${index + 1}`
  })
);

// eslint-disable-next-line design-system/no-design-literals -- Deliberate high-luminance runtime brand stress input.
const lightSelectionBrand = { accentColor: "#facc15", foregroundColor: "#111827" };
// eslint-disable-next-line design-system/no-design-literals -- Deliberate dark-mode runtime brand stress input.
const darkSelectionBrand = { accentColor: "#7c3aed", foregroundColor: "#ffffff" };

function MultiSelectHarness({
  items = tagItems,
  initialValue = [],
  ...props
}: Omit<
  MultiSelectProps<string>,
  "items" | "onChange" | "value"
> & {
  initialValue?: string[];
  items?: SelectCollectionItem[];
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <MultiSelect
      {...props}
      items={items}
      label="Теги"
      locale="ru-RU"
      onChange={setValue}
      placeholder="Выберите теги"
      value={value}
    />
  );
}

const meta = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  parameters: { layout: "centered" },
  tags: ["autodocs"]
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness />
};

export const SelectedTags: Story = {
  args: {} as never,
  render: () => (
    <MultiSelectHarness initialValue={["new", "priority", "delivery"]} />
  )
};

export const TagOverflow: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.width240}>
      <MultiSelectHarness
        block
        initialValue={[
          "new",
          "priority",
          "delivery",
          "retail",
          "wholesale",
          "archived"
        ]}
      />
    </div>
  )
};

export const LoadingMore: Story = {
  args: {} as never,
  render: () => (
    <MultiSelectHarness collectionState={{ status: "loading-more" }} />
  )
};

export const RemoteSelectedTags: Story = {
  args: {} as never,
  render: () => (
    <MultiSelect
      items={[]}
      label="Теги"
      locale="ru-RU"
      onChange={() => undefined}
      selectedItems={[
        { value: "remote:1", label: "Удалённый тег", textValue: "Удалённый тег" },
        { value: "remote:2", label: "Сохранённый тег", textValue: "Сохранённый тег" }
      ]}
      value={["remote:1", "remote:2"]}
    />
  )
};

export const Sizes: Story = {
  args: {} as never,
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <MultiSelectHarness size="sm" />
      <MultiSelectHarness size="md" />
      <MultiSelectHarness size="lg" />
    </div>
  )
};

export const SizesWithTags: Story = {
  args: {} as never,
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <MultiSelectHarness
          initialValue={["new", "priority"]}
          key={size}
          size={size}
        />
      ))}
    </div>
  )
};

export const SizesLoading: Story = {
  args: {} as never,
  render: () => (
    <MultiSelectHarness
      collectionState={{ status: "loading" }}
      initialValue={["new", "priority"]}
    />
  )
};

export const InnerLabelEmpty: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness labelView="inner" />
};

export const SelectedSm: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness initialValue={["new", "priority"]} labelView="inner" size="sm" />
};

export const SelectedMd: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness initialValue={["new", "priority"]} labelView="inner" size="md" />
};

export const SelectedLg: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness initialValue={["new", "priority"]} labelView="inner" size="lg" />
};

export const InnerSmSummary: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.width320}>
      <MultiSelectHarness
        block
        initialValue={["new", "priority", "delivery"]}
        labelView="inner"
        size="sm"
      />
    </div>
  )
};

export const InnerMdSummary: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.width320}>
      <MultiSelectHarness
        block
        initialValue={["new", "priority", "delivery"]}
        labelView="inner"
        size="md"
      />
    </div>
  )
};

export const InnerLgChips: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.width320}>
      <MultiSelectHarness
        block
        initialValue={["new", "priority", "delivery"]}
        labelView="inner"
        size="lg"
      />
    </div>
  )
};

export const InnerLabelOverflow: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.width180}>
      <MultiSelectHarness
        block
        initialValue={["new", "priority", "delivery", "retail"]}
        labelView="inner"
        size="lg"
      />
    </div>
  )
};

export const Overflow: Story = {
  args: {} as never,
  render: () => <div className={fixtureStyles.width180}><MultiSelectHarness block initialValue={["new", "priority", "delivery", "retail", "wholesale", "archived"]} /></div>
};

export const OuterLabelChips: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness initialValue={["new", "priority"]} labelView="outer" />
};

export const Block: Story = {
  args: {} as never,
  render: () => <div className={fixtureStyles.blockHost}><MultiSelectHarness block initialValue={["new", "priority"]} /></div>
};

export const WidthStability: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.stack}>
      {[0, 1, 5, 20].map((count) => (
        <div className={fixtureStyles.width320} key={count}>
          <MultiSelectHarness
            block
            clearable
            initialValue={manyTagItems.slice(0, count).map((item) =>
              item.type === "option" ? item.value : ""
            )}
            items={manyTagItems}
          />
        </div>
      ))}
      <div className={fixtureStyles.blockHost}>
        <MultiSelectHarness block initialValue={["new", "priority"]} />
      </div>
    </div>
  )
};

export const NarrowWidths: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.row}>
      <div className={fixtureStyles.width180}><MultiSelectHarness block initialValue={["new", "priority", "delivery"]} /></div>
      <div className={fixtureStyles.width240}><MultiSelectHarness block initialValue={["new", "priority", "delivery"]} /></div>
      <div className={fixtureStyles.width320}><MultiSelectHarness block initialValue={["new", "priority", "delivery"]} /></div>
    </div>
  )
};

export const Narrow180: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.width180}>
      <MultiSelectHarness block clearable initialValue={["new", "priority", "delivery", "retail"]} />
    </div>
  )
};

export const Narrow240: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.width240}>
      <MultiSelectHarness block clearable initialValue={["new", "priority", "delivery", "retail"]} />
    </div>
  )
};

export const Narrow320: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.width320}>
      <MultiSelectHarness block clearable initialValue={["new", "priority", "delivery", "retail"]} />
    </div>
  )
};

export const ChipMeasurement: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.row}>
      <div className={fixtureStyles.width180}>
        <MultiSelectHarness block clearable initialValue={["new", "priority", "delivery", "retail", "wholesale"]} />
      </div>
      <div className={fixtureStyles.width240}>
        <MultiSelectHarness block collectionState={{ status: "refreshing" }} initialValue={["new", "priority", "delivery", "retail", "wholesale"]} />
      </div>
      <div className={fixtureStyles.width320}>
        <MultiSelectHarness block initialValue={["new", "priority", "delivery", "retail", "wholesale"]} labelView="inner" size="lg" />
      </div>
    </div>
  )
};

export const ExactTriggerWidth: Story = {
  args: {} as never,
  render: () => <div className={fixtureStyles.width240}><MultiSelectHarness block /></div>
};

export const BrandSelectionLight: Story = {
  args: {} as never,
  render: () => (
    <DesignSystemProvider brand={lightSelectionBrand} mode="light">
      <div className={fixtureStyles.width320}>
        <MultiSelectHarness block initialValue={["new", "priority"]} open />
      </div>
    </DesignSystemProvider>
  )
};

export const BrandSelectionDark: Story = {
  args: {} as never,
  render: () => (
    <DesignSystemProvider brand={darkSelectionBrand} mode="dark">
      <div className={fixtureStyles.width320}>
        <MultiSelectHarness block initialValue={["new", "priority"]} open />
      </div>
    </DesignSystemProvider>
  )
};

export const Search: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness searchable />
};

export const SearchLoading: Story = {
  args: {} as never,
  render: () => (
    <MultiSelectHarness collectionState={{ status: "loading" }} items={[]} searchable />
  )
};

export const SearchActionRow: Story = {
  args: {} as never,
  render: () => (
    <MultiSelectHarness
      items={[
        {
          type: "action",
          id: "create",
          label: "Создать тег",
          textValue: "Создать тег",
          onSelect: () => undefined
        },
        ...tagItems
      ]}
      searchable
    />
  )
};

export const SearchMobileBottomSheet: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <MultiSelectHarness searchable />
};

export const ReadOnly: Story = {
  args: {} as never,
  render: () => (
    <MultiSelectHarness clearable initialValue={["new", "priority"]} readOnly />
  )
};

export const MobileSearchFocus: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <MultiSelectHarness open searchable />
};

export const VirtualizedLargeList: Story = {
  args: {} as never,
  render: () => (
    <MultiSelectHarness
      items={Array.from({ length: 10000 }, (_, index) => ({
        value: `virtual-${index}`,
        label: `Вариант ${index + 1}`,
        textValue: `Вариант ${index + 1}`
      }))}
      open
      searchable
    />
  )
};

export const LoadingInTrigger: Story = {
  args: {} as never,
  render: () => (
    <MultiSelectHarness collectionState={{ status: "loading" }} items={[]} />
  )
};

export const TagKeyboardRemoval: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness initialValue={["new", "priority"]} />
};

export const DesignerReference: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness initialValue={["new", "priority"]} />
};

const actionTagItems: SelectCollectionItem[] = [
  {
    type: "action",
    id: "create-tag",
    label: "Создать тег",
    textValue: "Создать тег",
    onSelect: () => undefined
  },
  ...tagItems
];

export const ActionKeyboardNonSearchable: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness items={actionTagItems} />
};

export const ActionKeyboardSearchable: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness items={actionTagItems} searchable />
};

export const InternalTabOrder: Story = {
  args: {} as never,
  render: () => <MultiSelectHarness items={actionTagItems} searchable />
};

export const GroupedLargeNoVirtualization: Story = {
  args: {} as never,
  render: () => (
    <MultiSelectHarness
      items={Array.from({ length: 6 }, (_, groupIndex) => ({
        type: "group" as const,
        id: `large-group-${groupIndex}`,
        label: `Группа ${groupIndex + 1}`,
        items: Array.from({ length: 100 }, (_, optionIndex) => ({
          value: `group-${groupIndex}-option-${optionIndex}`,
          label: `Вариант ${groupIndex + 1}.${optionIndex + 1}`,
          textValue: `Вариант ${groupIndex + 1}.${optionIndex + 1}`
        }))
      }))}
      open
    />
  )
};
