import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Dialog } from "../../Dialog/Dialog";
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

const meta = {
  title: "Fields/SelectMultiSelectBrowserRegression",
  component: Select,
  tags: ["test"],
  parameters: { layout: "centered" }
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    await expect(search).toHaveFocus();
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
    await expect(listbox).toHaveFocus();
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
