import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import type { SelectCollectionItem } from "../internal/select/collection";
import fixtureStyles from "../internal/select/SelectStories.module.css";
import { MultiSelect } from "./MultiSelect";

const tagItems: SelectCollectionItem[] = [
  { value: "new", label: "Новый", textValue: "Новый" },
  { value: "priority", label: "Приоритет", textValue: "Приоритет" },
  { value: "delivery", label: "Доставка", textValue: "Доставка" },
  { value: "retail", label: "Розница", textValue: "Розница" },
  { value: "wholesale", label: "Опт", textValue: "Опт" },
  { value: "archived", label: "Архив", textValue: "Архив" }
];

// eslint-disable-next-line design-system/no-design-literals -- Deliberate high-luminance runtime brand stress input.
const lightSelectionBrand = { accentColor: "#facc15", foregroundColor: "#111827" };
// eslint-disable-next-line design-system/no-design-literals -- Deliberate dark-mode runtime brand stress input.
const darkSelectionBrand = { accentColor: "#7c3aed", foregroundColor: "#ffffff" };

function MultiSelectHarness({
  items = tagItems,
  initialValue = [],
  ...props
}: Omit<
  ComponentProps<typeof MultiSelect>,
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
  render: () => <div className={fixtureStyles.width240}><MultiSelectHarness block initialValue={["new", "priority", "delivery", "retail"]} /></div>
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
  ...Search,
  parameters: { viewport: { defaultViewport: "mobile1" } }
};

export const LoadingInTrigger = SizesLoading;
export const TagKeyboardRemoval = SizesWithTags;
export const DesignerReference = SizesWithTags;
