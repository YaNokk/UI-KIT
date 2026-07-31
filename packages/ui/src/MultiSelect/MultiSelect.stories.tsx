import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { SelectCollectionItem } from "../internal/select/collection";
import { MultiSelect } from "./MultiSelect";

const tagItems: SelectCollectionItem[] = [
  { value: "new", label: "Новый", textValue: "Новый" },
  { value: "priority", label: "Приоритет", textValue: "Приоритет" },
  { value: "delivery", label: "Доставка", textValue: "Доставка" },
  { value: "retail", label: "Розница", textValue: "Розница" },
  { value: "wholesale", label: "Опт", textValue: "Опт" },
  { value: "archived", label: "Архив", textValue: "Архив" }
];

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
    <div className="w-64">
      <MultiSelectHarness
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
