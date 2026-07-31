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
import { MultiSelect, type MultiSelectProps } from "./MultiSelect";
import type { SelectCollectionItem } from "../internal/select/collection";

const baseItems: SelectCollectionItem[] = [
  { value: "a", label: "Альфа", textValue: "Альфа" },
  { value: "b", label: "Бета", textValue: "Бета" },
  { value: "c", label: "Гамма", textValue: "Гамма", disabled: true },
  { value: "d", label: "Дельта", textValue: "Дельта" }
];

function ControlledMulti(
  props: Partial<MultiSelectProps> & Pick<MultiSelectProps, "items">
) {
  const [value, setValue] = useState<string[]>(props.value ?? []);
  return (
    <MultiSelect
      {...props}
      label="Теги"
      locale={props.locale ?? "ru-RU"}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
      placeholder="Выберите теги"
      value={value}
      items={props.items}
    />
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MultiSelect", () => {
  it("toggles options immediately and stays open", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledMulti items={baseItems} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Теги/ }));
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");

    await user.click(screen.getByRole("option", { name: /Альфа/ }));
    expect(onChange).toHaveBeenCalledWith(["a"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: /Бета/ }));
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // toggle off
    await user.click(screen.getByRole("option", { name: /Альфа/ }));
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("renders selected tags in the closed trigger", async () => {
    render(<ControlledMulti items={baseItems} value={["a", "b"]} />);
    const trigger = screen.getByRole("button", { name: /Теги/ });
    expect(trigger.parentElement).toHaveTextContent("Альфа");
    expect(trigger.parentElement).toHaveTextContent("Бета");
  });

  it("tag remove deletes value and does not open the select", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledMulti items={baseItems} onChange={onChange} value={["a", "b"]} />
    );

    await user.click(screen.getByRole("button", { name: "Убрать Альфа" }));
    expect(onChange).toHaveBeenCalledWith(["b"]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps tag remove controls outside the primary trigger button", () => {
    render(<ControlledMulti items={baseItems} value={["a", "b"]} />);
    const trigger = screen.getByRole("button", { name: /Теги/ });
    expect(trigger.querySelector("button")).toBeNull();
    expect(screen.getAllByRole("button", { name: /Убрать/ })).toHaveLength(2);
  });

  it("clear all resets selection without opening", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledMulti
        clearable
        items={baseItems}
        onChange={onChange}
        value={["a", "b"]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Очистить выбор" }));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Backspace on focused trigger removes the last selected value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledMulti items={baseItems} onChange={onChange} value={["a", "b"]} />
    );

    const trigger = screen.getByRole("button", { name: /Теги/ });
    trigger.focus();
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenCalledWith(["a"]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Space toggles the active option via keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledMulti items={baseItems} onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: /Теги/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}"); // Бета
    await user.keyboard(" ");

    expect(onChange).toHaveBeenCalledWith(["b"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("action executes, selection unchanged, stays consistent", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCreate = vi.fn();
    const items: SelectCollectionItem[] = [
      {
        type: "action",
        id: "create",
        label: "Новый тег",
        textValue: "Новый тег",
        onSelect: onCreate
      },
      ...baseItems
    ];
    render(
      <ControlledMulti items={items} onChange={onChange} value={["a"]} />
    );

    await user.click(screen.getByRole("button", { name: /Теги/ }));
    await user.click(await screen.findByRole("button", { name: "Новый тег" }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("selected tags survive when current items page changes", async () => {
    function Harness() {
      const [page, setPage] = useState(0);
      const pages: SelectCollectionItem[][] = [
        [
          { value: "a", label: "Альфа", textValue: "Альфа" },
          { value: "b", label: "Бета", textValue: "Бета" }
        ],
        [
          { value: "c", label: "Гамма", textValue: "Гамма" },
          { value: "d", label: "Дельта", textValue: "Дельта" }
        ]
      ];
      return (
        <>
          <MultiSelect
            items={pages[page] ?? []}
            label="Теги"
            onChange={() => {}}
            selectedItems={[
              { value: "a", label: "Альфа", textValue: "Альфа" },
              { value: "b", label: "Бета", textValue: "Бета" }
            ]}
            value={["a", "b"]}
          />
          <button onClick={() => setPage(1)}>Next page</button>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: /Теги/ });
    expect(trigger.parentElement).toHaveTextContent("Альфа");

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(trigger.parentElement).toHaveTextContent("Альфа");
    expect(trigger.parentElement).toHaveTextContent("Бета");
  });

  it("renders remote selected values through selectedItems cache", () => {
    render(
      <ControlledMulti
        items={baseItems}
        selectedItems={[
          {
            value: "remote:1",
            label: "Удалённый клиент",
            textValue: "Удалённый клиент"
          }
        ]}
        value={["remote:1" as never]}
      />
    );
    const trigger = screen.getByRole("button", { name: /Теги/ });
    expect(trigger.parentElement).toHaveTextContent("Удалённый клиент");
  });

  it("loading status does not clear selected tags", async () => {
    const user = userEvent.setup();
    render(
      <ControlledMulti
        collectionState={{ status: "loading" }}
        items={[]}
        value={["a", "b"]}
        selectedItems={[
          { value: "a", label: "Альфа", textValue: "Альфа" },
          { value: "b", label: "Бета", textValue: "Бета" }
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: /Теги/ });
    expect(trigger.parentElement).toHaveTextContent("Альфа");

    await user.click(trigger);
    expect(await screen.findByRole("status")).toHaveTextContent("Загрузка");
  });
});
