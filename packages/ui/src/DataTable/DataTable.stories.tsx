import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { DataTable } from "./DataTable";
import type { DataTableColumn, DataTableSelection, DataTableSort } from "./types";

interface ExampleRow { id: number; customer: string; status: string; note: string }
const rows: ExampleRow[] = [
  { id: 1042, customer: "Анна Каренина", status: "Оплачен", note: "Доставка после 18:00\nПозвонить заранее" },
  { id: 1043, customer: "Борис Пастернак", status: "Создан", note: "Самовывоз" },
  { id: 1044, customer: "Вера Павлова", status: "Отменён", note: "Причина уточняется" }
];
const columns: DataTableColumn<ExampleRow>[] = [
  { id: "id", header: "Заказ", headerLabel: "Заказ", accessor: "id", hideable: false, reorderable: true, resizable: true, sortable: true, sticky: "start", width: 112 },
  { id: "customer", header: "Клиент", headerLabel: "Клиент", render: (row) => <a href={`/customers/${row.id}`} onClick={(event) => event.preventDefault()}>{row.customer}</a>, reorderable: true, resizable: true, sortable: true, width: 220 },
  { id: "status", header: "Статус", headerLabel: "Статус", accessor: "status", reorderable: true, resizable: true, width: 160 },
  { id: "note", header: "Комментарий", headerLabel: "Комментарий", render: (row) => <span style={{ whiteSpace: "pre-wrap" }}>{row.note}</span>, overflow: "wrap", reorderable: true, resizable: true, width: 280 },
  { id: "actions", header: "Действия", headerLabel: "Действия", render: () => <button type="button">Меню</button>, reorderable: true, sticky: "end", width: 120 }
];

const meta = {
  title: "Components/Table",
  parameters: { docs: { description: { component: "Native semantic table foundation and controlled DataTable behavior. Horizontal scrolling, sticky geometry and density are owned by the component." } } }
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

interface DemoProps {
  compact?: boolean;
  empty?: boolean;
  expanded?: boolean;
  interactive?: boolean;
  loading?: boolean;
  noResults?: boolean;
  refreshing?: boolean;
  selectionMode?: "explicit" | "query";
  sticky?: boolean;
  manyRows?: boolean;
  wide?: boolean;
}

function Demo({ compact, empty, expanded: expandable, interactive, loading, manyRows, noResults, refreshing, selectionMode, sticky, wide }: DemoProps) {
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [selection, setSelection] = useState<DataTableSelection<number>>(
    selectionMode === "query" ? { mode: "all", excludedKeys: [] } : { mode: "explicit", selectedKeys: [] }
  );
  const [lastAction, setLastAction] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [order, setOrder] = useState(columns.map((column) => column.id));
  const [sizing, setSizing] = useState<Record<string, number>>({});
  const sourceRows = empty || noResults ? [] : manyRows ? Array.from({ length: 30 }, (_, index) => ({ ...(rows[index % rows.length] ?? { customer: "Клиент", status: "Создан", note: "" }), id: 2000 + index })) : rows;
  const interactiveColumns = interactive ? columns.map((column) => column.id === "customer" ? {
    ...column,
    render: (row: ExampleRow) => <a href={`/customers/${row.id}`} onClick={(event) => { event.preventDefault(); setLastAction(row.id); }}>{row.customer}</a>
  } : column) : columns;
  const actionColumn = interactiveColumns.at(-1);
  const sourceColumns = wide && actionColumn ? [...interactiveColumns.slice(0, -1), ...interactiveColumns.slice(1, 4).map((column, index) => ({ ...column, id: `${column.id}-${index}`, header: `${column.header} ${index + 2}` })), actionColumn] : interactiveColumns;
  return (
    <div style={{ maxWidth: "100%" }}>
      <DataTable
        aria-label="Заказы"
        columnOrder={order}
        columnSizing={sizing}
        columns={sourceColumns}
        density={compact ? "compact" : "default"}
        emptyState="Заказов пока нет"
        expandedRowKeys={expanded}
        getRowKey={(row) => row.id}
        loading={Boolean(loading)}
        {...(noResults ? { noResultsState: "По фильтрам ничего не найдено" } : {})}
        onColumnOrderChange={setOrder}
        onColumnSizingChange={setSizing}
        onExpandedRowKeysChange={setExpanded}
        {...(selectionMode ? { onSelectionChange: setSelection, selection } : {})}
        onSortChange={setSort}
        refreshing={Boolean(refreshing)}
        {...(expandable ? { renderExpandedRow: (row: ExampleRow) => <div>История заказа {row.id}</div> } : {})}
        rows={sourceRows}
        {...(sticky ? { scrollAreaMaxBlockSize: "calc(var(--ds-size-table-row-default) * 5)" } : {})}
        sort={sort}
        stickyHeader={Boolean(sticky)}
      />
      {interactive && <output aria-live="polite">{lastAction == null ? "Действие не выбрано" : `Действие строки ${lastAction}`}</output>}
    </div>
  );
}

const multiPinnedColumns: DataTableColumn<ExampleRow>[] = [
  { id: "id", header: "Заказ start", headerLabel: "Заказ start", accessor: "id", reorderable: true, sticky: "start", width: 128 },
  { id: "customer", header: "Клиент start", headerLabel: "Клиент start", render: (row) => <a href={`/customers/${row.id}`}>{row.customer}</a>, reorderable: true, resizable: true, sticky: "start", width: 208 },
  { id: "status", header: "Статус", accessor: "status", reorderable: true, width: 180 },
  { id: "note", header: "Комментарий", accessor: "note", reorderable: true, width: 320 },
  { id: "details", header: "Подробности", render: (row) => `Заказ ${row.id}: ${row.note}`, reorderable: true, width: 280 },
  { id: "summary", header: "Итог end", headerLabel: "Итог end", render: () => "1 200 ₽", reorderable: true, sticky: "end", width: 144 },
  { id: "actions", header: "Действия end", headerLabel: "Действия end", render: () => <button type="button">Меню</button>, reorderable: true, sticky: "end", width: 152 }
];

function MultiPinnedDemo({ direction = "ltr", inlineSize = "360px" }: { direction?: "ltr" | "rtl"; inlineSize?: string }) {
  const [order, setOrder] = useState(multiPinnedColumns.map((column) => column.id));
  const [sizing, setSizing] = useState<Record<string, number>>({});
  return (
    <div dir={direction} style={{ inlineSize, maxInlineSize: "100%" }}>
      <DataTable
        aria-label="Заказы с несколькими закреплёнными столбцами"
        columnOrder={order}
        columnSizing={sizing}
        columns={multiPinnedColumns}
        getRowKey={(row) => row.id}
        onColumnOrderChange={setOrder}
        onColumnSizingChange={setSizing}
        rows={rows}
      />
    </div>
  );
}

function intersectionInlineSize(first: DOMRect, second: DOMRect): number {
  return Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
}

function assertPinnedGeometry(scrollOwner: HTMLElement) {
  const viewport = scrollOwner.getBoundingClientRect();
  for (const row of scrollOwner.querySelectorAll<HTMLTableRowElement>("tr")) {
    const starts = Array.from(row.querySelectorAll<HTMLElement>("[data-sticky='start']"));
    const ends = Array.from(row.querySelectorAll<HTMLElement>("[data-sticky='end']"));
    for (const start of starts) {
      for (const end of ends) {
        expect(intersectionInlineSize(start.getBoundingClientRect(), end.getBoundingClientRect())).toBeLessThanOrEqual(1);
      }
    }
    for (const control of row.querySelectorAll<HTMLElement>("[data-sticky] button,[data-sticky] a,[data-sticky] [tabindex]")) {
      const bounds = control.getBoundingClientRect();
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
      expect(bounds.right).toBeGreaterThan(viewport.left);
      expect(bounds.left).toBeLessThan(viewport.right);
      const owner = control.closest<HTMLElement>("[data-sticky]");
      const opposite = owner?.dataset.sticky === "start" ? ends : starts;
      for (const cell of opposite) expect(intersectionInlineSize(bounds, cell.getBoundingClientRect())).toBe(0);
    }
  }
}

async function reorderPinnedZones(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const startHandle = canvas.getByRole("button", { name: "Переместить столбец Заказ start" });
  startHandle.focus();
  await userEvent.keyboard(" {ArrowRight} ");
  const endHandle = canvas.getByRole("button", { name: "Переместить столбец Итог end" });
  endHandle.focus();
  await userEvent.keyboard(" {ArrowRight} ");
  const headers = canvas.getAllByRole("columnheader");
  await expect(headers[0]).toHaveTextContent("Клиент start");
  await expect(headers[1]).toHaveTextContent("Заказ start");
  await expect(headers.at(-2)).toHaveTextContent("Действия end");
  await expect(headers.at(-1)).toHaveTextContent("Итог end");
}

interface TableGeometrySnapshot {
  cellWidths: number[];
  dataRowBlockStart: number;
  dataRowHeight: number;
  headerRowHeight: number;
  tableHeight: number;
}

function captureTableGeometry(canvasElement: HTMLElement): TableGeometrySnapshot {
  const canvas = within(canvasElement);
  const table = canvas.getByRole("table");
  const renderedRows = canvas.getAllByRole("row");
  const headerRow = renderedRows[0];
  const dataRow = renderedRows[1];
  if (!headerRow || !dataRow) throw new Error("Table geometry rows are unavailable");
  const dataRect = dataRow.getBoundingClientRect();
  return {
    cellWidths: [...Array.from(headerRow.children), ...Array.from(dataRow.children)]
      .map((cell) => cell.getBoundingClientRect().width),
    dataRowBlockStart: dataRect.top,
    dataRowHeight: dataRect.height,
    headerRowHeight: headerRow.getBoundingClientRect().height,
    tableHeight: table.getBoundingClientRect().height
  };
}

function expectStableTableGeometry(before: TableGeometrySnapshot, after: TableGeometrySnapshot) {
  expect(Math.abs(after.headerRowHeight - before.headerRowHeight)).toBeLessThanOrEqual(0.1);
  expect(Math.abs(after.tableHeight - before.tableHeight)).toBeLessThanOrEqual(0.1);
  expect(Math.abs(after.dataRowBlockStart - before.dataRowBlockStart)).toBeLessThanOrEqual(0.1);
  expect(Math.abs(after.dataRowHeight - before.dataRowHeight)).toBeLessThanOrEqual(0.1);
  expect(after.cellWidths).toHaveLength(before.cellWidths.length);
  after.cellWidths.forEach((width, index) => {
    expect(Math.abs(width - (before.cellWidths[index] ?? width))).toBeLessThanOrEqual(0.1);
  });
}

export const Basic: Story = { render: () => <Demo /> };
export const Sortable: Story = { render: () => <Demo />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const button = canvas.getByRole("button", { name: "Заказ" }); await userEvent.click(button); await expect(canvas.getByRole("columnheader", { name: /Заказ/ })).toHaveAttribute("aria-sort", "ascending"); } };
export const SortableWithoutCallback: Story = { render: () => <DataTable aria-label="Заказы без сортировки" columns={columns} getRowKey={(row) => row.id} rows={rows} sort={null} />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByRole("columnheader", { name: "Заказ" })).not.toHaveAttribute("aria-sort"); await expect(canvas.queryByRole("button", { name: "Заказ" })).not.toBeInTheDocument(); } };
export const StickyHeader: Story = { render: () => <Demo manyRows sticky />, play: async ({ canvasElement }) => { const root = canvasElement.querySelector<HTMLElement>(".ds-table-scroll"); const header = canvasElement.querySelector<HTMLElement>(".ds-table-header-cell"); if (!root || !header) throw new Error("Sticky geometry is unavailable"); root.scrollTop = 240; await new Promise((resolve) => requestAnimationFrame(resolve)); const rootTop = root.getBoundingClientRect().top; const headerTop = header.getBoundingClientRect().top; await expect(Math.abs(headerTop - rootTop)).toBeLessThanOrEqual(2); } };
export const StickyColumns: Story = { render: () => <Demo wide /> };
export const StickyStartEnd: Story = { render: () => <Demo wide />, play: async ({ canvasElement }) => { const root = canvasElement.querySelector<HTMLElement>(".ds-table-scroll"); const start = within(canvasElement).getByRole("columnheader", { name: /Заказ/ }); const end = within(canvasElement).getByRole("columnheader", { name: /Действия/ }); if (!root) throw new Error("Scroll owner is unavailable"); root.scrollLeft = root.scrollWidth; await new Promise((resolve) => requestAnimationFrame(resolve)); const viewport = root.getBoundingClientRect(); await expect(Math.abs(start.getBoundingClientRect().left - viewport.left)).toBeLessThanOrEqual(2); await expect(Math.abs(end.getBoundingClientRect().right - viewport.right)).toBeLessThanOrEqual(2); } };
export const ReorderedPinnedZonesNarrow: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <MultiPinnedDemo />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const root = canvasElement.querySelector<HTMLElement>(".ds-table-scroll"); if (!root) throw new Error("Narrow scroll owner is unavailable"); await waitFor(() => expect(root).toHaveAttribute("data-pinning-fallback", "true")); await reorderPinnedZones(canvasElement); const resize = canvas.getByRole("separator", { name: "Изменить ширину столбца Клиент start" }); resize.focus(); await userEvent.keyboard("{ArrowRight}"); await expect(resize).toHaveAttribute("aria-valuenow", "216"); root.scrollLeft = root.scrollWidth; await new Promise((resolve) => requestAnimationFrame(resolve)); assertPinnedGeometry(root); await expect(root.querySelectorAll("th[data-sticky]")).toHaveLength(1); const pinnedHandle = canvas.getByRole("button", { name: "Переместить столбец Клиент start" }); pinnedHandle.focus(); await userEvent.tab(); await expect(resize).toHaveFocus(); const viewport = root.getBoundingClientRect(); const focusBounds = resize.getBoundingClientRect(); await expect(focusBounds.left).toBeGreaterThanOrEqual(viewport.left); await expect(focusBounds.right).toBeLessThanOrEqual(viewport.right); } };
export const ReorderedPinnedZonesNarrowRtl: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <MultiPinnedDemo direction="rtl" />, play: async ({ canvasElement }) => { const root = canvasElement.querySelector<HTMLElement>(".ds-table-scroll"); if (!root) throw new Error("Narrow RTL scroll owner is unavailable"); await waitFor(() => expect(root).toHaveAttribute("data-pinning-fallback", "true")); await reorderPinnedZones(canvasElement); root.scrollLeft = -root.scrollWidth; await new Promise((resolve) => requestAnimationFrame(resolve)); assertPinnedGeometry(root); await expect(root.querySelectorAll("th[data-sticky]")).toHaveLength(1); const viewport = root.getBoundingClientRect(); const pinned = within(canvasElement).getByRole("columnheader", { name: /Клиент start/ }).getBoundingClientRect(); await expect(Math.abs(pinned.right - viewport.right)).toBeLessThanOrEqual(2); } };
export const ReorderedPinnedZonesDesktop: Story = { parameters: { viewport: { defaultViewport: "desktop" } }, render: () => <MultiPinnedDemo inlineSize="1024px" />, play: async ({ canvasElement }) => { const root = canvasElement.querySelector<HTMLElement>(".ds-table-scroll"); if (!root) throw new Error("Desktop scroll owner is unavailable"); await waitFor(() => expect(root.querySelectorAll("th[data-sticky]")).toHaveLength(4)); await expect(root).not.toHaveAttribute("data-pinning-fallback"); await reorderPinnedZones(canvasElement); root.scrollLeft = root.scrollWidth; await new Promise((resolve) => requestAnimationFrame(resolve)); assertPinnedGeometry(root); await expect(root.querySelectorAll("th[data-sticky='start']")).toHaveLength(2); await expect(root.querySelectorAll("th[data-sticky='end']")).toHaveLength(2); } };
export const ResizableColumns: Story = { render: () => <Demo /> };
export const ResizableColumnsKeyboardRegression: Story = { tags: ["test-only"], render: () => <Demo />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const handle = canvas.getByRole("separator", { name: "Изменить ширину столбца Клиент" }); const header = canvas.getByRole("columnheader", { name: /Клиент/ }); const bodyCells = rows.map((row) => canvas.getByRole("link", { name: row.customer }).closest<HTMLElement>("td")).filter((cell): cell is HTMLElement => cell != null); const initialWidth = header.getBoundingClientRect().width; handle.focus(); await userEvent.keyboard("{ArrowRight}"); await expect(handle).toHaveAttribute("aria-valuenow", "228"); await expect(header.style.width).toBe("228px"); const renderedWidth = header.getBoundingClientRect().width; await expect(renderedWidth - initialWidth).toBeGreaterThan(0.1); for (const cell of bodyCells) await expect(Math.abs(cell.getBoundingClientRect().width - renderedWidth)).toBeLessThanOrEqual(0.1); } };
export const ReorderableColumns: Story = { render: () => <Demo />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const handle = canvas.getByRole("button", { name: "Переместить столбец Клиент" }); handle.focus(); await userEvent.keyboard(" {ArrowRight} "); const headers = canvas.getAllByRole("columnheader"); await expect(headers[1]).toHaveTextContent("Статус"); await expect(headers[2]).toHaveTextContent("Клиент"); } };
export const ReorderAndResize: Story = { render: () => <Demo />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const handle = canvas.getByRole("button", { name: "Переместить столбец Клиент" }); const statusHeader = canvas.getByRole("columnheader", { name: /Статус/ }); fireEvent.dragStart(handle); fireEvent.drop(statusHeader); const reorderedHeaders = canvas.getAllByRole("columnheader"); await expect(reorderedHeaders[1]).toHaveTextContent("Статус"); const resize = canvas.getByRole("separator", { name: "Изменить ширину столбца Клиент" }); resize.focus(); await userEvent.keyboard("{ArrowRight}"); await expect(canvas.getByRole("separator", { name: "Изменить ширину столбца Клиент" })).toHaveAttribute("aria-valuenow", "228"); const endHeader = canvas.getByRole("columnheader", { name: /Действия/ }); const movedHandle = canvas.getByRole("button", { name: "Переместить столбец Клиент" }); fireEvent.dragStart(movedHandle); fireEvent.drop(endHeader); await expect(canvas.getAllByRole("columnheader")[2]).toHaveTextContent("Клиент"); } };
export const SelectionExplicit: Story = { render: () => <Demo selectionMode="explicit" /> };
export const SelectionExplicitGeometryRegression: Story = { tags: ["test-only"], render: () => <Demo selectionMode="explicit" />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const initial = captureTableGeometry(canvasElement); const firstRow = canvas.getByRole("checkbox", { name: "Выбрать строку 1042" }); await userEvent.click(firstRow); await expect(canvas.getByRole("checkbox", { name: "Выбрать строки на странице" })).toBePartiallyChecked(); expectStableTableGeometry(initial, captureTableGeometry(canvasElement)); await userEvent.click(canvas.getByRole("checkbox", { name: "Выбрать строки на странице" })); await expect(canvas.getByRole("checkbox", { name: "Выбрать строки на странице" })).toBeChecked(); expectStableTableGeometry(initial, captureTableGeometry(canvasElement)); } };
export const SelectionQuery: Story = { render: () => <Demo selectionMode="query" />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const page = canvas.getByRole("checkbox", { name: "Выбрать строки на странице" }); await expect(page).toBeChecked(); const row = canvas.getByRole("checkbox", { name: "Выбрать строку 1042" }); await userEvent.click(row); await expect(row).not.toBeChecked(); await expect(page).toBePartiallyChecked(); } };
export const ClickableRows: Story = { render: () => <Demo interactive />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const link = canvas.getByRole("link", { name: "Анна Каренина" }); link.focus(); await userEvent.keyboard("{Enter}"); await expect(canvas.getByText("Действие строки 1042")).toBeVisible(); const menu = canvas.getAllByRole("button", { name: "Меню" }).at(0); if (menu) await userEvent.click(menu); await expect(canvas.getByText("Действие строки 1042")).toBeVisible(); } };
export const InteractiveCells: Story = { render: () => <Demo interactive />, play: async ({ canvasElement }) => { const button = within(canvasElement).getAllByRole("button", { name: "Меню" }).at(0); if (button) await userEvent.click(button); } };
export const ExpandableRows: Story = { render: () => <Demo expanded />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getAllByRole("button", { name: "Развернуть строку" })[0] as HTMLElement); await expect(canvas.getByText("История заказа 1042")).toBeVisible(); } };
export const ExpansionWithoutCallback: Story = { render: () => <DataTable aria-label="Заказы без управления раскрытием" columns={columns} getRowKey={(row) => row.id} renderExpandedRow={(row) => <div>История заказа {row.id}</div>} rows={rows} />, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole("button", { name: "Развернуть строку" })).not.toBeInTheDocument(); } };
export const Loading: Story = { render: () => <Demo loading /> };
export const Refreshing: Story = { render: () => <Demo refreshing /> };
export const Empty: Story = { render: () => <Demo empty /> };
export const NoResults: Story = { render: () => <Demo noResults /> };
export const Compact: Story = { render: () => <Demo compact />, play: async ({ canvasElement }) => { const rows = within(canvasElement).getAllByRole("row"); await expect(rows[2]?.getBoundingClientRect().height ?? 0).toBeGreaterThanOrEqual(40); } };
export const HorizontalScroll: Story = { render: () => <Demo wide /> };
export const DynamicHeight: Story = { render: () => <Demo />, play: async ({ canvasElement }) => { const bodyRows = within(canvasElement).getAllByRole("row").slice(1); await expect(bodyRows[0]?.getBoundingClientRect().height ?? 0).toBeGreaterThan(48); await expect(bodyRows[1]?.getBoundingClientRect().height ?? 0).toBeGreaterThanOrEqual(48); } };
export const RightToLeft: Story = { render: () => <div dir="rtl"><Demo wide /></div>, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const handle = canvas.getAllByRole("separator", { name: "Изменить ширину столбца Клиент" }).at(0); if (!handle) throw new Error("RTL resize handle is unavailable"); handle.focus(); await userEvent.keyboard("{ArrowRight}"); await expect(canvas.getAllByRole("separator", { name: "Изменить ширину столбца Клиент" }).at(0)).toHaveAttribute("aria-valuenow", "212"); const root = canvasElement.querySelector<HTMLElement>(".ds-table-scroll"); const start = canvas.getByRole("columnheader", { name: /Заказ/ }); const end = canvas.getByRole("columnheader", { name: /Действия/ }); if (!root) throw new Error("RTL scroll owner is unavailable"); root.scrollLeft = -root.scrollWidth; await new Promise((resolve) => requestAnimationFrame(resolve)); const viewport = root.getBoundingClientRect(); await expect(Math.abs(start.getBoundingClientRect().right - viewport.right)).toBeLessThanOrEqual(2); await expect(Math.abs(end.getBoundingClientRect().left - viewport.left)).toBeLessThanOrEqual(2); } };
export const Dark: Story = { render: () => <div data-theme="dark" style={{ padding: "var(--ds-space-4)" }}><Demo wide /></div> };
