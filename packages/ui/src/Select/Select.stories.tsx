import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Dialog } from "../Dialog/Dialog";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import type { SelectCollectionItem } from "../internal/select/collection";
import fixtureStyles from "../internal/select/SelectStories.module.css";
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

// eslint-disable-next-line design-system/no-design-literals -- Deliberate high-luminance runtime brand stress input.
const lightSelectionBrand = { accentColor: "#facc15", foregroundColor: "#111827" };
// eslint-disable-next-line design-system/no-design-literals -- Deliberate dark-mode runtime brand stress input.
const darkSelectionBrand = { accentColor: "#7c3aed", foregroundColor: "#ffffff" };

function SelectHarness({
  items = customerItems,
  initialValue = null,
  ...props
}: Omit<ComponentProps<typeof Select>, "items" | "onChange" | "value"> & {
  initialValue?: string | null;
  items?: SelectCollectionItem[];
}) {
  const [value, setValue] = useState<string | null>(initialValue);
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

function ControlledSearchSelect() {
  const [query, setQuery] = useState("");
  const preparedItems = customerItems.filter((item) => {
    if (item.type !== "group") return true;
    return item.items.some((option) =>
      option.textValue.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    );
  });

  return (
    <SelectHarness
      items={preparedItems}
      searchable
      searchProps={{ onChange: setQuery, value: query }}
    />
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

export const LongPlaceholderResting: Story = {
  args: {} as never,
  tags: ["test"],
  render: () => (
    <div className={fixtureStyles.width240}>
      <SelectHarness block placeholder="Очень длинный placeholder закрытого Select" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: /Клиент/ });
    const placeholder = trigger.querySelector<HTMLElement>("[data-field-placeholder]");
    if (!placeholder) throw new Error("Select placeholder was not rendered.");
    await expect(getComputedStyle(placeholder).visibility).toBe("hidden");
  }
};

export const LongPlaceholderFocused: Story = {
  args: {} as never,
  tags: ["test"],
  render: () => (
    <div className={fixtureStyles.width240}>
      <SelectHarness block open placeholder="Очень длинный placeholder открытого Select" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: /Клиент/ });
    const placeholder = trigger.querySelector<HTMLElement>("[data-field-placeholder]");
    if (!placeholder) throw new Error("Select placeholder was not rendered.");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(getComputedStyle(placeholder).visibility).toBe("visible");
  }
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
  render: () => <div className={fixtureStyles.width240}><SelectHarness block /></div>
};

export const LongOptionText: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.width240}>
      <SelectHarness block items={[{
        value: "long",
        label: "Очень длинное название клиента, которое не должно расширять панель",
        textValue: "Очень длинное название клиента, которое не должно расширять панель"
      }]} />
    </div>
  )
};

export const PanelAvailableHeight: Story = {
  args: {} as never,
  render: () => (
    <SelectHarness
      items={Array.from({ length: 120 }, (_, index) => ({
        value: `height-${index}`,
        label: `Клиент ${index + 1}`,
        textValue: `Клиент ${index + 1}`
      }))}
      open
      searchable
    />
  )
};

export const InnerLabelSizes: Story = {
  args: {} as never,
  render: () => (
    <div className={fixtureStyles.stack}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <SelectHarness initialValue="ivan" key={size} labelView="inner" size={size} />
      ))}
    </div>
  )
};

export const Block: Story = {
  args: {} as never,
  render: () => <div className={fixtureStyles.blockHost}><SelectHarness block /></div>
};

export const NarrowViewport: Story = {
  args: {} as never,
  render: () => <div className={fixtureStyles.width180}><SelectHarness block /></div>
};

export const BrandSelectedLight: Story = {
  args: {} as never,
  render: () => (
    <DesignSystemProvider brand={lightSelectionBrand} mode="light">
      <div className={fixtureStyles.width320}>
        <SelectHarness block initialValue="ivan" open />
      </div>
    </DesignSystemProvider>
  )
};

export const BrandSelectedDark: Story = {
  args: {} as never,
  render: () => (
    <DesignSystemProvider brand={darkSelectionBrand} mode="dark">
      <div className={fixtureStyles.width320}>
        <SelectHarness block initialValue="ivan" open />
      </div>
    </DesignSystemProvider>
  )
};

export const Search: Story = {
  args: {} as never,
  render: () => <SelectHarness searchable />
};

export const SearchUncontrolled: Story = {
  args: {} as never,
  render: () => <SelectHarness open searchable />
};

export const SearchControlled: Story = {
  args: {} as never,
  render: () => <ControlledSearchSelect />
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
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <SelectHarness searchable />
};

export const ReadOnly: Story = {
  args: {} as never,
  render: () => <SelectHarness clearable initialValue="ivan" readOnly />
};

export const MobileSearchFocus: Story = {
  args: {} as never,
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => <SelectHarness open searchable />
};

export const VirtualizedLargeList: Story = {
  args: {} as never,
  render: () => (
    <SelectHarness
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
    <SelectHarness collectionState={{ status: "loading" }} items={[]} />
  )
};

export const RichOptions: Story = {
  args: {} as never,
  render: () => <SelectHarness />
};

export const Groups: Story = {
  args: {} as never,
  render: () => <SelectHarness />
};

export const DesignerReference: Story = {
  args: {} as never,
  render: () => <SelectHarness />
};

export const ActionKeyboardNonSearchable: Story = {
  args: {} as never,
  render: () => <SelectHarness />
};

export const ActionKeyboardSearchable: Story = {
  args: {} as never,
  render: () => <SelectHarness searchable />
};

export const ActionDisabled: Story = {
  args: {} as never,
  render: () => (
    <SelectHarness items={[
      {
        type: "action",
        id: "disabled-create",
        label: "Создание недоступно",
        textValue: "Создание недоступно",
        disabled: true,
        onSelect: () => undefined
      },
      { value: "ivan", label: "Иван Иванов", textValue: "Иван Иванов" }
    ]} />
  )
};

export const InternalTabOrder: Story = {
  args: {} as never,
  render: () => <SelectHarness searchable />
};

export const GroupedLargeNoVirtualization: Story = {
  args: {} as never,
  render: () => (
    <SelectHarness
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

export const TypographySmMdLg: Story = {
  args: {} as never,
  render: () => <div className="grid w-80 gap-3"><SelectHarness size="sm" /><SelectHarness size="md" /><SelectHarness size="lg" open /></div>
};

function SearchableDialogHarness() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Dialog
      closeLabel="Close dialog"
      onOpenChange={() => undefined}
      open
      title="Select in dialog"
    >
      <Select
        items={customerItems}
        label="Client"
        locale="en"
        onChange={setValue}
        searchable
        size="lg"
        value={value}
      />
    </Dialog>
  );
}

export const SearchableInsideDialog: Story = {
  args: {} as never,
  render: () => <SearchableDialogHarness />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole("button", { name: "Client" });
    const chevron = trigger.closest("[data-field-part=\"shell\"]")
      ?.querySelector<HTMLElement>("[data-select-chevron]");
    if (!chevron) throw new Error("Select chevron was not rendered");

    await userEvent.click(chevron);
    const search = await body.findByRole("textbox", { name: "Search options" });
    await expect(search).toHaveFocus();
    await userEvent.type(search, "Ivan");
    await expect(search).toHaveValue("Ivan");
  }
};
