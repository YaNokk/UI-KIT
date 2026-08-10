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

  it("uses a real primary link for keyboard activation and isolates nested controls", async () => {
    const onPrimaryAction = vi.fn();
    const interactiveColumns: DataTableColumn<Row>[] = [
      ...columns,
      {
        id: "primary-action",
        header: "Основное действие",
        render: (row) => <a href={`/customers/${row.id}`} onClick={(event) => { event.preventDefault(); onPrimaryAction(row); }}>{row.name}</a>
      },
      {
        id: "custom-action",
        header: "Другое действие",
        render: () => <span role="button" tabIndex={0}>Пользовательское действие</span>
      }
    ];
    render(<DataTable aria-label="Клиенты" columns={interactiveColumns} getRowKey={(row) => row.id} rows={rows} />);
    const nestedButton = screen.getAllByRole("button", { name: "Открыть меню" }).at(0);
    expect(nestedButton).toBeDefined();
    if (nestedButton) await userEvent.click(nestedButton);
    expect(onPrimaryAction).not.toHaveBeenCalled();
    await userEvent.click(screen.getAllByRole("button", { name: "Пользовательское действие" })[0] as HTMLElement);
    expect(onPrimaryAction).not.toHaveBeenCalled();
    const primaryLink = screen.getByRole("link", { name: "Анна" });
    primaryLink.focus();
    await userEvent.keyboard("{Enter}");
    expect(onPrimaryAction).toHaveBeenCalledWith(rows[0]);
    expect(screen.getAllByRole("row")[1]).not.toHaveAttribute("tabindex");
  });

  it("header selection always selects only the current page", async () => {
    const onSelectionChange = vi.fn();
    const selection: DataTableSelection<number> = { mode: "explicit", selectedKeys: [] };
    render(<DataTable aria-label="Клиенты" columns={columns} getRowKey={(row) => row.id} onSelectionChange={onSelectionChange} rows={rows} selection={selection} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Выбрать строки на странице" }));
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
