import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
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
  return (
    <div className={styles.stack}>
      <Select
        clearable
        items={baseItems}
        label="ReadOnly Select"
        locale="ru-RU"
        onChange={() => undefined}
        open
        readOnly
        value="alpha"
      />
      <MultiSelect
        clearable
        items={baseItems}
        label="ReadOnly MultiSelect"
        locale="ru-RU"
        onChange={() => undefined}
        open
        readOnly
        value={["alpha", "beta"]}
      />
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

    await userEvent.click(trigger);
    const listbox = await body.findByRole("listbox");
    listbox.focus();
    await expect(listbox).toHaveFocus();
    await userEvent.click(trigger);
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(transitions).toHaveTextContent("true,false,true,false");

    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("button", { name: "Outside target" }));
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());

    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(transitions).toHaveTextContent(
      "true,false,true,false,true,false,true,false"
    );
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
    const select = canvas.getByRole("button", { name: "ReadOnly Select" });
    const multi = canvas.getByRole("button", { name: "ReadOnly MultiSelect" });
    await expect(select).toHaveAttribute("aria-expanded", "false");
    await expect(multi).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("button", { name: "Очистить выбор" }))
      .not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: /Убрать/ }))
      .not.toBeInTheDocument();

    await userEvent.click(select);
    await userEvent.keyboard("{Enter} ");
    await userEvent.click(multi);
    await userEvent.keyboard("{Enter}{Backspace}");
    await expect(canvasElement.ownerDocument.querySelector("[data-select-surface]"))
      .toBeNull();
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
