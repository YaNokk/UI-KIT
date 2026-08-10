// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable } from "./DataTable";
import type { DataTableColumn, DataTableSelection } from "./types";

interface Row { id: number; name: string }
const rows: Row[] = [{ id: 1, name: "Анна" }, { id: 2, name: "Борис" }];
const columns: DataTableColumn<Row>[] = [
  { id: "id", header: "ID", accessor: "id", sortable: true, sticky: "start", width: 80 },
  { id: "name", header: "Имя", accessor: "name", resizable: true, width: 160 },
  { id: "actions", header: "Действия", render: () => <button type="button">Открыть меню</button>, sticky: "end", width: 120 }
];

afterEach(cleanup);

describe("DataTable", () => {
  it("cycles controlled sorting and exposes aria-sort", async () => {
    const onSortChange = vi.fn();
    render(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} onSortChange={onSortChange} rows={rows} sort={null} />);
    expect(screen.getByRole("columnheader", { name: /ID/ })).toHaveAttribute("aria-sort", "none");
    await userEvent.click(screen.getByRole("button", { name: /ID/ }));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: "id", direction: "asc" });
  });

  it("does not render an inert sort control without the controlled callback", () => {
    render(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} rows={rows} sort={null} />);
    expect(screen.getByRole("columnheader", { name: "ID" })).not.toHaveAttribute("aria-sort");
    expect(screen.queryByRole("button", { name: "ID" })).not.toBeInTheDocument();
  });

  it("activates actionable rows from passive areas and Enter while isolating nested controls", async () => {
    const onRowAction = vi.fn();
    const onNestedAction = vi.fn();
    const interactiveColumns: DataTableColumn<Row>[] = [
      {
        id: "name",
        header: "Имя",
        accessor: "name",
        reorderable: true,
        resizable: true
      },
      {
        id: "controls",
        header: "Интерактивные элементы",
        reorderable: true,
        render: () => (
          <div>
            <button onClick={onNestedAction} type="button">Кнопка</button>
            <a href="#details" onClick={(event) => event.preventDefault()}>Ссылка</a>
            <input aria-label="Поле" />
            <label><input type="checkbox" />Подпись checkbox</label>
            <select aria-label="Список" defaultValue="a"><option value="a">A</option></select>
            <textarea aria-label="Текст" />
            <span onClick={onNestedAction} role="button" tabIndex={0}>Custom button</span>
            <span data-table-interactive="" onClick={onNestedAction}>Custom interactive</span>
          </div>
        )
      }
    ];
    render(
      <DataTable
        aria-label="Клиенты"
        columns={interactiveColumns}
        expandedRowKeys={[]}
        getRowKey={(row) => row.id}
        onColumnOrderChange={() => undefined}
        onColumnSizingChange={() => undefined}
        onExpandedRowKeysChange={() => undefined}
        onRowAction={onRowAction}
        onSelectionChange={() => undefined}
        renderExpandedRow={(row) => `Подробности ${row.name}`}
        rows={rows}
        selection={{ mode: "explicit", selectedKeys: [] }}
      />
    );

    await userEvent.click(screen.getByText("Анна"));
    expect(onRowAction).toHaveBeenLastCalledWith(rows[0]);
    onRowAction.mockClear();

    const actionableRow = screen.getAllByRole("row")[1] as HTMLTableRowElement;
    expect(actionableRow).toHaveAttribute("tabindex", "0");
    expect(actionableRow).toHaveAttribute("data-actionable", "true");
    actionableRow.focus();
    await userEvent.keyboard("{Enter}");
    expect(onRowAction).toHaveBeenLastCalledWith(rows[0]);
    onRowAction.mockClear();

    for (const control of [
      screen.getAllByRole("button", { name: "Кнопка" })[0],
      screen.getAllByRole("link", { name: "Ссылка" })[0],
      screen.getAllByRole("textbox", { name: "Поле" })[0],
      screen.getAllByText("Подпись checkbox")[0],
      screen.getAllByRole("combobox", { name: "Список" })[0],
      screen.getAllByRole("textbox", { name: "Текст" })[0],
      screen.getAllByRole("button", { name: "Custom button" })[0],
      screen.getAllByText("Custom interactive")[0],
      screen.getByRole("checkbox", { name: "Выбрать строку 1" }),
      screen.getAllByRole("button", { name: "Развернуть строку" })[0],
      screen.getByRole("button", { name: "Переместить столбец Имя" })
    ]) {
      expect(control).toBeDefined();
      if (control) await userEvent.click(control);
      expect(onRowAction).not.toHaveBeenCalled();
    }
    fireEvent.click(screen.getByRole("separator", { name: "Изменить ширину столбца Имя" }));
    expect(onRowAction).not.toHaveBeenCalled();
  });

  it("header selection always selects only the current page", async () => {
    const onSelectionChange = vi.fn();
    const selection: DataTableSelection<number> = { mode: "explicit", selectedKeys: [] };
    render(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} onSelectionChange={onSelectionChange} rows={rows} selection={selection} />);
    const pageCheckbox = screen.getByRole("checkbox", { name: "Выбрать строки на странице" });
    expect(pageCheckbox.closest("th")).toHaveAttribute("data-align", "center");
    expect(screen.getByRole("checkbox", { name: "Выбрать строку 1" }).closest("td")).toHaveAttribute("data-align", "center");
    await userEvent.click(pageCheckbox);
    expect(onSelectionChange).toHaveBeenCalledWith({ mode: "explicit", selectedKeys: [1, 2] });
  });

  it("updates query-wide exclusions without materializing server IDs", async () => {
    const onSelectionChange = vi.fn();
    const selection: DataTableSelection<number> = { mode: "all", excludedKeys: [] };
    render(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} onSelectionChange={onSelectionChange} rows={rows} selection={selection} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Выбрать строку 1" }));
    expect(onSelectionChange).toHaveBeenCalledWith({ mode: "all", excludedKeys: [1] });
  });

  it("renders expansion as an associated following row", async () => {
    const onExpandedRowKeysChange = vi.fn();
    render(<DataTable aria-label="Клиенты" columns={columns} expandedRowKeys={[]} getRowKey={(row) => row.id} onExpandedRowKeysChange={onExpandedRowKeysChange} renderExpandedRow={(row) => `Подробности ${row.name}`} rows={rows} />);
    const expandButton = screen.getAllByRole("button", { name: "Развернуть строку" }).at(0);
    expect(expandButton).toBeDefined();
    if (expandButton) await userEvent.click(expandButton);
    expect(onExpandedRowKeysChange).toHaveBeenCalledWith([1]);
  });

  it("does not render an inert expansion control without the controlled callback", () => {
    render(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} renderExpandedRow={(row) => `Подробности ${row.name}`} rows={rows} />);
    expect(screen.queryByRole("button", { name: "Развернуть строку" })).not.toBeInTheDocument();
  });

  it("stops the renderer-owned resize gesture on pointer cancellation", () => {
    const onColumnSizingChange = vi.fn();
    render(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} onColumnSizingChange={onColumnSizingChange} rows={rows} />);
    const handle = screen.getByRole("separator", { name: "Изменить ширину столбца Имя" });
    Object.assign(handle, {
      hasPointerCapture: vi.fn(() => false),
      releasePointerCapture: vi.fn(),
      setPointerCapture: vi.fn()
    });
    const pointerEvent = (type: string, clientX: number) => {
      const event = new MouseEvent(type, { bubbles: true, clientX });
      Object.defineProperty(event, "pointerId", { value: 7 });
      return event;
    };
    fireEvent(handle, pointerEvent("pointerdown", 100));
    fireEvent(window, pointerEvent("pointermove", 120));
    expect(onColumnSizingChange).toHaveBeenLastCalledWith({ name: 180 });
    fireEvent(window, pointerEvent("pointercancel", 120));
    const callCount = onColumnSizingChange.mock.calls.length;
    fireEvent(window, pointerEvent("pointermove", 160));
    expect(onColumnSizingChange).toHaveBeenCalledTimes(callCount);
  });

  it("commits a pointer resize to header and body cell widths", () => {
    function ResizeHarness() {
      const [sizing, setSizing] = useState<Record<string, number>>({});
      return <DataTable aria-label="Клиенты" columnSizing={sizing} columns={columns} getRowKey={(row) => row.id} onColumnSizingChange={setSizing} rows={rows} />;
    }
    render(<ResizeHarness />);
    const handle = screen.getByRole("separator", { name: "Изменить ширину столбца Имя" });
    Object.assign(handle, {
      hasPointerCapture: vi.fn(() => false),
      releasePointerCapture: vi.fn(),
      setPointerCapture: vi.fn()
    });
    const pointerEvent = (type: string, clientX: number) => {
      const event = new MouseEvent(type, { bubbles: true, clientX });
      Object.defineProperty(event, "pointerId", { value: 11 });
      return event;
    };
    fireEvent(handle, pointerEvent("pointerdown", 100));
    fireEvent(window, pointerEvent("pointermove", 120));
    fireEvent(window, pointerEvent("pointerup", 120));
    const header = screen.getByRole("columnheader", { name: /Имя/ });
    const bodyCell = screen.getByText("Анна").closest("td");
    expect(header).toHaveStyle({ width: "180px" });
    expect(bodyCell).toHaveStyle({ width: "180px" });
    fireEvent(window, pointerEvent("pointermove", 160));
    expect(header).toHaveStyle({ width: "180px" });
  });

  it("distinguishes initial loading, refreshing, empty and no-results", () => {
    const { rerender } = render(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} loading rows={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Загрузка данных");
    rerender(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} refreshing rows={rows} />);
    expect(screen.getByRole("status", { name: "Обновление данных" })).toBeInTheDocument();
    expect(screen.getByText("Анна")).toBeInTheDocument();
    rerender(<DataTable aria-label="Клиенты" columns={columns} emptyState="Пусто" getRowKey={(row) => row.id} rows={[]} />);
    expect(screen.getByText("Пусто")).toBeInTheDocument();
    rerender(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} noResultsState="Ничего не найдено" rows={[]} />);
    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
  });
});
