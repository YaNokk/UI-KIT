// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import {
  cleanup,
  render,
  screen,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { Select, type SelectProps } from "./Select";
import type { SelectCollectionItem } from "../internal/select/collection";

const baseItems: SelectCollectionItem[] = [
  { value: "a", label: "Альфа", textValue: "Альфа" },
  { value: "b", label: "Бета", textValue: "Бета" },
  { value: "c", label: "Гамма", textValue: "Гамма", disabled: true },
  { value: "d", label: "Дельта", textValue: "Дельта" }
];

function ControlledSelect(
  props: Partial<SelectProps> & Pick<SelectProps, "items">
) {
  const [value, setValue] = useState<string | null>(props.value ?? null);
  return (
    <Select
      {...props}
      label="Клиент"
      locale={props.locale ?? "ru-RU"}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
      placeholder="Выберите клиента"
      value={value}
      items={props.items}
    />
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Select", () => {
  it("keeps selected leading content decorative without changing its name", () => {
    render(
      <ControlledSelect
        items={[{
          value: "a",
          label: "Альфа",
          textValue: "Альфа",
          leading: (
            <svg aria-label="Customer icon" role="img">
              <circle cx="8" cy="8" r="4" />
            </svg>
          )
        }]}
        value="a"
      />
    );

    const trigger = screen.getByRole("button", { name: "Клиент" });
    expect(trigger).toHaveAccessibleName("Клиент");
    expect(trigger).not.toHaveAccessibleName(/Customer icon/);
    const leading = trigger.closest("[data-field-part=\"shell\"]")
      ?.querySelector("[data-field-part=\"start-adornment\"]");
    expect(leading?.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img", { name: "Customer icon" }))
      .not.toBeInTheDocument();
  });

  it("renders placeholder and opens with options", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect items={baseItems} />);

    const trigger = screen.getByRole("button", { name: /Клиент/ });
    expect(trigger).toHaveAttribute("data-select-trigger");
    const chevron = trigger.querySelector<HTMLElement>("[data-select-chevron]");
    expect(chevron).toHaveAttribute("aria-hidden", "true");
    expect(trigger).toContainElement(chevron);
    expect(trigger).toHaveTextContent("Выберите клиента");
    expect(trigger.querySelector("[data-control-text-clip]")).toContainElement(
      trigger.querySelector("[data-control-text]")
    );
    expect(trigger.querySelector("[data-control-text]"))
      .toHaveAttribute("data-control-text-role", "fieldValueTextMd");

    await user.click(trigger);
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(listbox).toHaveFocus();
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect(listbox.querySelector("[data-control-text-clip]")).toContainElement(
      listbox.querySelector("[data-choice-control-label]")
    );
    expect(listbox.querySelector("[data-choice-control-label]"))
      .toHaveAttribute("data-control-text-role", "choiceControlLabel");
    // trigger keeps a single role with expanded state
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("opens when the pointer activates the chevron area", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect items={baseItems} />);

    const trigger = document.querySelector<HTMLButtonElement>(
      "[data-select-trigger]"
    );
    if (!trigger) throw new Error("Select trigger was not rendered");
    const chevron = trigger.closest("[data-field-part=\"shell\"]")
      ?.querySelector<HTMLElement>("[data-select-chevron]");
    expect(chevron).not.toBeNull();

    await user.click(chevron as HTMLElement);

    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes an open popover trigger exactly once after listbox focus", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ControlledSelect items={baseItems} onOpenChange={onOpenChange} />
    );

    const trigger = screen.getByRole("button", { name: "Клиент" });
    await user.click(trigger);
    const listbox = await screen.findByRole("listbox");
    await waitFor(() => expect(listbox).toHaveFocus());

    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onOpenChange.mock.calls.map(([nextOpen]) => nextOpen))
      .toEqual([true, false]);
  });

  it("selects an option and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledSelect items={baseItems} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    await user.click(await screen.findByRole("option", { name: /Бета/ }));

    expect(onChange).toHaveBeenCalledWith("b");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Клиент/ }))
      .toHaveTextContent("Бета");
  });

  it("keyboard: open, navigate skipping disabled, Enter selects", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledSelect items={baseItems} onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: /Клиент/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    // initial active = first enabled option (Альфа)
    await user.keyboard("{ArrowDown}"); // Бета
    await user.keyboard("{ArrowDown}"); // skips disabled Гамма → Дельта
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("d");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("typeahead activates option by textValue", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect items={baseItems} />);

    const trigger = screen.getByRole("button", { name: /Клиент/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    await user.keyboard("д");
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: /Клиент/ }))
      .toHaveTextContent("Дельта");
  });

  it("clear does not open the select and resets value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledSelect clearable items={baseItems} onChange={onChange} value="a" />
    );

    const clear = screen.getByRole("button", { name: "Очистить выбор" });
    expect(clear).toHaveAttribute("data-select-clear");
    expect(screen.getByRole("button", { name: /Клиент/ })).not.toContainElement(clear);
    await user.click(clear);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("required select hides clear affordance", () => {
    render(<ControlledSelect clearable required items={baseItems} value="a" />);
    expect(
      screen.queryByRole("button", { name: "Очистить выбор" })
    ).not.toBeInTheDocument();
  });

  it("action row executes once, keeps selection and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCreate = vi.fn();
    const items: SelectCollectionItem[] = [
      {
        type: "action",
        id: "create",
        label: "Создать клиента",
        textValue: "Создать клиента",
        onSelect: onCreate
      },
      ...baseItems
    ];
    render(
      <ControlledSelect items={items} onChange={onChange} value="a" />
    );

    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    await user.click(
      await screen.findByRole("button", { name: "Создать клиента" })
    );

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("groups are skipped during navigation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const items: SelectCollectionItem[] = [
      {
        type: "group",
        id: "g1",
        label: "Группа 1",
        items: [
          { value: "a", label: "Альфа", textValue: "Альфа" },
          { value: "b", label: "Бета", textValue: "Бета" }
        ]
      },
      {
        type: "group",
        id: "g2",
        label: "Группа 2",
        items: [{ value: "c", label: "Гамма", textValue: "Гамма" }]
      }
    ];
    render(<ControlledSelect items={items} onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: /Клиент/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");

    // Headings render but are not options
    expect(screen.getByText("Группа 1")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Группа 1" }))
      .toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);

    await user.keyboard("{End}");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("renders selected value outside current items via selectedItem cache", () => {
    render(
      <ControlledSelect
        items={baseItems}
        selectedItem={{
          value: "customer:842",
          label: "Иван Иванов",
          textValue: "Иван Иванов"
        }}
        value={"customer:842" as never}
      />
    );
    expect(screen.getByRole("button", { name: /Клиент/ }))
      .toHaveTextContent("Иван Иванов");
  });

  it("items refresh preserves selection", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState<string | null>(null);
      const [items, setItems] = useState<SelectCollectionItem[]>(baseItems);
      return (
        <>
          <Select
            items={items}
            label="Клиент"
            onChange={setValue}
            value={value}
          />
          <Button
            onClick={() =>
              setItems([
                { value: "b", label: "Бета", textValue: "Бета" },
                { value: "x", label: "Икс", textValue: "Икс" }
              ])
            }
            variant="secondary"
          >
            Refresh
          </Button>
        </>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    await user.click(await screen.findByRole("option", { name: /Бета/ }));
    expect(screen.getByRole("button", { name: /Клиент/ }))
      .toHaveTextContent("Бета");

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(screen.getByRole("button", { name: /Клиент/ }))
      .toHaveTextContent("Бета");
  });

  it("loading status renders a status row, not fake options", async () => {
    const user = userEvent.setup();
    render(
      <ControlledSelect
        collectionState={{ status: "loading" }}
        items={[]}
      />
    );
    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    const trigger = screen.getByRole("button", { name: /Клиент/ });
    expect(trigger).toHaveAttribute("aria-busy", "true");
    expect(trigger.closest("[data-field-part=\"shell\"]")
      ?.querySelector("[data-select-spinner]"))
      .toHaveAttribute("aria-hidden", "true");
    expect(await screen.findByRole("status")).toHaveTextContent("Загрузка");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("empty status renders localized empty text", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect items={[]} />);
    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    expect(await screen.findByRole("status")).toHaveTextContent("Нет вариантов");
  });

  it("error status supports consumer retry without owning fetch", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ControlledSelect
        collectionState={{ status: "error", onRetry }}
        items={[]}
      />
    );
    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    expect(await screen.findByRole("alert"))
      .toHaveTextContent("Не удалось загрузить варианты");
    await user.click(screen.getByRole("button", { name: "Повторить" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("loading-more keeps existing options interactive", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledSelect
        collectionState={{ status: "loading-more" }}
        items={baseItems}
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    await user.click(await screen.findByRole("option", { name: /Бета/ }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("Escape inside Dialog closes Select before Dialog", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [dialogOpen, setDialogOpen] = useState(true);
      const [value, setValue] = useState<string | null>(null);
      const [selectOpen, setSelectOpen] = useState(false);
      return (
        <Dialog
          closeLabel="Закрыть Dialog"
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          title="Parent Dialog"
        >
          <Select
            items={baseItems}
            label="Клиент"
            onChange={setValue}
            onOpenChange={setSelectOpen}
            open={selectOpen}
            value={value}
          />
        </Dialog>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("dialog", { name: "Parent Dialog" }))
      .toBeInTheDocument();
  });

  it("action row flow: Select closes first, consumer opens Dialog", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState<string | null>(null);
      const [dialogOpen, setDialogOpen] = useState(false);
      const items: SelectCollectionItem[] = [
        {
          type: "action",
          id: "create",
          label: "Создать клиента",
          textValue: "Создать клиента",
          onSelect: () => setDialogOpen(true)
        },
        ...baseItems
      ];
      return (
        <>
          <Select
            items={items}
            label="Клиент"
            onChange={setValue}
            value={value}
          />
          <Dialog
            closeLabel="Закрыть"
            onOpenChange={setDialogOpen}
            open={dialogOpen}
            title="Новый клиент"
          >
            Форма создания
          </Dialog>
        </>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    const listbox = await screen.findByRole("listbox");
    const action = await screen.findByRole("button", { name: "Создать клиента" });
    expect(listbox).not.toContainElement(action);
    await user.click(action);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(await screen.findByRole("dialog", { name: "Новый клиент" }))
      .toBeInTheDocument();
  });

  it("large collection navigates without rendering every option", async () => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    const user = userEvent.setup();
    const largeItems: SelectCollectionItem[] = Array.from(
      { length: 10000 },
      (_, index) => ({
        value: "v" + index,
        label: "Вариант " + index,
        textValue: "Вариант " + index,
        disabled: index % 97 === 0 && index !== 0
      })
    );
    render(<ControlledSelect items={largeItems} />);

    const trigger = screen.getByRole("button", { name: /Клиент/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    // Only a window of rows is mounted
    const mounted = document.querySelectorAll('[role="option"]').length;
    expect(mounted).toBeLessThan(200);

    await user.keyboard("{End}");
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Клиент/ }))
        .toHaveTextContent("Вариант 9999");
    });
  });

  it("DEV warns on duplicate option values", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ControlledSelect
        items={[
          { value: "a", label: "Один", textValue: "Один" },
          { value: "a", label: "Два", textValue: "Два" }
        ]}
      />
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate option value "a"')
    );
  });

  it("search filters options and keeps action outside listbox semantics", async () => {
    const user = userEvent.setup();
    render(
      <ControlledSelect
        items={[
          {
            type: "action",
            id: "create",
            label: "Создать клиента",
            textValue: "Создать клиента",
            onSelect: () => undefined
          },
          ...baseItems
        ]}
        searchable
      />
    );

    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    const search = await screen.findByRole("textbox", { name: "Поиск по вариантам" });
    expect(search).toHaveFocus();
    await user.type(search, "Бета");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: /Бета/ })).toBeInTheDocument();
    const action = screen.getByRole("button", { name: "Создать клиента" });
    expect(screen.getByRole("listbox")).not.toContainElement(action);
  });

  it("controlled external search does not filter prepared items again", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <ControlledSelect
        items={baseItems}
        searchable
        searchProps={{ value: "нет совпадений", onChange: onSearchChange }}
      />
    );
    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    expect(await screen.findAllByRole("option")).toHaveLength(4);
  });

  it("keeps a controlled search value as the only query source", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <ControlledSelect
        items={baseItems}
        searchable
        searchProps={{ value: "server", onChange: onSearchChange }}
      />
    );

    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    const search = await screen.findByRole("textbox", { name: "Поиск по вариантам" });
    await user.type(search, " next");
    expect(onSearchChange).toHaveBeenCalled();
    expect(search).toHaveValue("server");

    await user.keyboard("{Escape}");
    expect(onSearchChange).toHaveBeenLastCalledWith("");
  });

  it("DEV warns and exposes value-without-onChange as read-only external search", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <ControlledSelect
        items={baseItems}
        searchable
        searchProps={{ value: "server" }}
      />
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("controlled and read-only")
    );
    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    expect(await screen.findByRole("textbox", { name: "Поиск по вариантам" }))
      .toHaveAttribute("readonly");
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("uses native disabled semantics for hoisted actions", async () => {
    const user = userEvent.setup();
    render(
      <ControlledSelect
        items={[
          {
            type: "action",
            disabled: true,
            id: "disabled-action",
            label: "Недоступное действие",
            onSelect: () => undefined,
            textValue: "Недоступное действие"
          },
          ...baseItems
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: /Клиент/ }));
    expect(await screen.findByRole("button", { name: "Недоступное действие" }))
      .toBeDisabled();
  });

  it("keeps readOnly trigger focusable without opening from pointer or keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ControlledSelect
        clearable
        items={baseItems}
        onChange={onChange}
        onOpenChange={onOpenChange}
        readOnly
        value="a"
      />
    );
    const trigger = screen.getByRole("button", { name: /Клиент/ });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toBeDisabled();
    expect(trigger.tabIndex).toBe(0);
    expect(screen.queryByRole("button", { name: "Очистить выбор" }))
      .not.toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    for (const command of [
      "{Enter}",
      " ",
      "{ArrowDown}",
      "{ArrowUp}",
      "{Home}",
      "{End}",
      "{Backspace}",
      "{Delete}"
    ]) {
      await user.keyboard(command);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    }
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps a searchable panel inside the Dialog focus scope", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <Dialog
          closeLabel="Close Dialog"
          onOpenChange={() => undefined}
          open
          title="Parent Dialog"
        >
          <Select
            items={baseItems}
            label="Client"
            locale="en"
            onChange={setValue}
            searchable
            value={value}
          />
        </Dialog>
      );
    }
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Client" }));
    const search = await screen.findByRole("textbox", { name: "Search options" });
    const floatingContainer = document.querySelector(
      "[data-modal-floating-container]"
    );

    expect(floatingContainer).toContainElement(
      document.querySelector("[data-select-surface]")
    );
    expect(search).toHaveFocus();
    await user.type(search, "a");
    expect(search).toHaveValue("a");
  });
});
