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
  it("renders placeholder and opens with options", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect items={baseItems} />);

    const trigger = screen.getByRole("button", { name: /Клиент/ });
    expect(trigger).toHaveTextContent("Выберите клиента");

    await user.click(trigger);
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(listbox).toHaveFocus();
    expect(screen.getAllByRole("option")).toHaveLength(4);
    // trigger keeps a single role with expanded state
    expect(trigger).toHaveAttribute("aria-expanded", "true");
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

    await user.click(screen.getByRole("button", { name: "Очистить выбор" }));
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
});
