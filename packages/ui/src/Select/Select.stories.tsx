import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog } from "../Dialog/Dialog";
import type { SelectCollectionItem } from "../internal/select/collection";
import { Select } from "./Select";

const customerItems: SelectCollectionItem[] = [
  {
    type: "action",
    id: "create-customer",
    label: "Создать клиента",
    textValue: "Создать клиента",
    onSelect: () => undefined
  },
  {
    type: "group",
    id: "active",
    label: "Активные",
    items: [
      {
        value: "ivan",
        label: "Иван Иванов",
        textValue: "Иван Иванов",
        description: "+7 900 000-00-01",
        trailing: "Активен"
      },
      {
        value: "maria",
        label: "Мария Соколова",
        textValue: "Мария Соколова",
        description: "+7 900 000-00-02",
        trailing: "Активен"
      }
    ]
  },
  {
    type: "group",
    id: "archived",
    label: "Архив",
    items: [
      {
        value: "alex",
        label: "Алексей Петров",
        textValue: "Алексей Петров",
        description: "Архивный клиент",
        disabled: true
      }
    ]
  }
];

function SelectHarness({
  items = customerItems,
  ...props
}: Omit<ComponentProps<typeof Select>, "items" | "onChange" | "value"> & {
  items?: SelectCollectionItem[];
}) {
  const [value, setValue] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const resolvedItems = items.map((item) =>
    item.type === "action"
      ? { ...item, onSelect: () => setCreated(true) }
      : item
  );
  return (
    <>
      <Select
        {...props}
        items={resolvedItems}
        label="Клиент"
        locale="ru-RU"
        onChange={setValue}
        placeholder="Выберите клиента"
        value={value}
      />
      {created ? <output>Форма создания открыта</output> : null}
    </>
  );
}

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"]
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as never,
  render: () => <SelectHarness />
};

export const RichGroupsAndAction: Story = {
  args: {} as never,
  render: () => <SelectHarness />
};

export const CollectionLoading: Story = {
  args: {} as never,
  render: () => (
    <SelectHarness collectionState={{ status: "loading" }} items={[]} />
  )
};

export const CollectionError: Story = {
  args: {} as never,
  render: () => (
    <SelectHarness
      collectionState={{
        status: "error",
        message: "Не удалось загрузить клиентов",
        onRetry: () => undefined
      }}
      items={[]}
    />
  )
};

export const RemoteSelectedValue: Story = {
  args: {} as never,
  render: () => (
    <Select
      items={[]}
      label="Клиент"
      locale="ru-RU"
      onChange={() => undefined}
      selectedItem={{
        value: "remote:42",
        label: "Удалённый клиент",
        textValue: "Удалённый клиент"
      }}
      value="remote:42"
    />
  )
};

export const LongCollection: Story = {
  args: {} as never,
  render: () => (
    <SelectHarness
      items={Array.from({ length: 10000 }, (_, index) => ({
        value: `customer-${index}`,
        label: `Клиент ${index + 1}`,
        textValue: `Клиент ${index + 1}`,
        description: "Проверка прокрутки и typeahead"
      }))}
      searchable
    />
  )
};

export const InsideDialog: Story = {
  args: {} as never,
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Dialog
        closeLabel="Закрыть"
        onOpenChange={setOpen}
        open={open}
        title="Новый заказ"
      >
        <SelectHarness />
      </Dialog>
    );
  }
};

export const Sizes: Story = {
  args: {} as never,
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <SelectHarness size="sm" />
      <SelectHarness size="md" />
      <SelectHarness size="lg" />
    </div>
  )
};

export const SizesLoading: Story = {
  args: {} as never,
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SelectHarness
          collectionState={{ status: "loading" }}
          items={[]}
          key={size}
          size={size}
        />
      ))}
    </div>
  )
};

export const SizesClearable: Story = {
  args: {} as never,
  render: () => <SelectHarness clearable />
};

export const ExactTriggerWidth: Story = {
  args: {} as never,
  render: () => <div className="w-64"><SelectHarness /></div>
};

export const LongOptionText: Story = {
  args: {} as never,
  render: () => (
    <div className="w-64">
      <SelectHarness items={[{
        value: "long",
        label: "Очень длинное название клиента, которое не должно расширять панель",
        textValue: "Очень длинное название клиента, которое не должно расширять панель"
      }]} />
    </div>
  )
};

export const NarrowViewport = ExactTriggerWidth;

export const Search: Story = {
  args: {} as never,
  render: () => <SelectHarness searchable />
};

export const SearchLoading: Story = {
  args: {} as never,
  render: () => (
    <SelectHarness collectionState={{ status: "loading" }} items={[]} searchable />
  )
};

export const SearchRefreshing: Story = {
  args: {} as never,
  render: () => (
    <SelectHarness collectionState={{ status: "refreshing" }} searchable />
  )
};

export const SearchActionRow: Story = {
  args: {} as never,
  render: () => <SelectHarness searchable />
};

export const SearchMobileBottomSheet: Story = {
  ...Search,
  parameters: { viewport: { defaultViewport: "mobile1" } }
};

export const LoadingInTrigger = CollectionLoading;
export const RichOptions = RichGroupsAndAction;
export const Groups = RichGroupsAndAction;
export const DesignerReference = RichGroupsAndAction;
