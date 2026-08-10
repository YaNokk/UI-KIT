import {
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnSizingState,
  type ExpandedState,
  type RowData,
  type SortingState
} from "@tanstack/react-table";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { Checkbox } from "../Checkbox/index.js";
import { Spinner } from "../Spinner/index.js";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableExpandCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableScrollContainer,
  TableSelectionCell
} from "../Table/index.js";
import { classNames } from "../shared/classNames.js";
import {
  EMPTY_COLUMN_SIZING,
  EMPTY_COLUMN_VISIBILITY,
  getCompleteColumnOrder,
  getControlledColumnPinning,
  getDataTableRowId,
  reorderColumnInZone,
  resolveNonOverlappingColumnPinning
} from "./dataTableAdapter.js";
import type {
  DataTableColumn,
  DataTablePinnedColumnIds,
  DataTableRowKey,
  DataTableSelection,
  DataTableSort
} from "./types.js";
import "./DataTable.css";

const dataTableFeatures = tableFeatures({
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowSortingFeature
});

const SPECIAL_COLUMN_WIDTH = 48;
const MINIMUM_SCROLL_FLOW_WIDTH = SPECIAL_COLUMN_WIDTH;
const DEFAULT_COLUMN_WIDTH = 160;
const EMPTY_EXPANDED_ROW_KEYS: DataTableRowKey[] = [];

export interface DataTableProps<Row extends RowData, Key extends DataTableRowKey = DataTableRowKey> {
  rows: Row[];
  columns: DataTableColumn<Row>[];
  getRowKey: (row: Row) => Key;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  caption?: ReactNode;
  className?: string;
  density?: "default" | "compact";
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  selection?: DataTableSelection<Key>;
  onSelectionChange?: (selection: DataTableSelection<Key>) => void;
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  columnVisibility?: Record<string, boolean>;
  columnSizing?: Record<string, number>;
  onColumnSizingChange?: (value: Record<string, number>) => void;
  pinnedColumnIds?: DataTablePinnedColumnIds;
  expandedRowKeys?: Key[];
  onExpandedRowKeysChange?: (keys: Key[]) => void;
  renderExpandedRow?: (row: Row) => ReactNode;
  stickyHeader?: boolean;
  scrollAreaMaxBlockSize?: CSSProperties["maxBlockSize"];
  loading?: boolean;
  refreshing?: boolean;
  emptyState?: ReactNode;
  noResultsState?: ReactNode;
}

function includesKey<Key extends DataTableRowKey>(keys: Key[], key: Key): boolean {
  return keys.includes(key);
}

function isSelected<Key extends DataTableRowKey>(selection: DataTableSelection<Key> | undefined, key: Key): boolean {
  if (!selection) return false;
  return selection.mode === "all" ? !includesKey(selection.excludedKeys, key) : includesKey(selection.selectedKeys, key);
}

function columnStyle(width: number, stickyOffset: number | null): CSSProperties {
  return {
    width,
    minWidth: width,
    maxWidth: width,
    ...(stickyOffset == null ? {} : { "--ds-table-sticky-offset": `${stickyOffset}px` })
  } as CSSProperties;
}

function nextSort(sort: DataTableSort | null | undefined, columnId: string): DataTableSort | null {
  if (sort?.columnId !== columnId) return { columnId, direction: "asc" };
  if (sort.direction === "asc") return { columnId, direction: "desc" };
  return null;
}

export function DataTable<Row extends RowData, Key extends DataTableRowKey = DataTableRowKey>({
  rows,
  columns,
  getRowKey,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  caption,
  className,
  density = "default",
  sort,
  onSortChange,
  selection,
  onSelectionChange,
  columnOrder,
  onColumnOrderChange,
  columnVisibility,
  columnSizing,
  onColumnSizingChange,
  pinnedColumnIds,
  expandedRowKeys,
  onExpandedRowKeysChange,
  renderExpandedRow,
  stickyHeader = false,
  scrollAreaMaxBlockSize,
  loading = false,
  refreshing = false,
  emptyState = "Нет данных",
  noResultsState
}: DataTableProps<Row, Key>) {
  const controlledExpandedRowKeys = expandedRowKeys ?? EMPTY_EXPANDED_ROW_KEYS as Key[];
  const hasSelection = Boolean(selection && onSelectionChange);
  const hasExpansion = Boolean(renderExpandedRow && onExpandedRowKeysChange);
  const hasSorting = Boolean(onSortChange);
  const leadingWidth = (hasSelection ? SPECIAL_COLUMN_WIDTH : 0) + (hasExpansion ? SPECIAL_COLUMN_WIDTH : 0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [viewportInlineSize, setViewportInlineSize] = useState<number | null>(null);
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    const update = () => setViewportInlineSize((current) => {
      const next = scrollContainer.clientWidth;
      return current === next ? current : next;
    });
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(scrollContainer);
    return () => observer.disconnect();
  }, []);
  const controlledColumnOrder = useMemo(() => getCompleteColumnOrder(columns, columnOrder), [columns, columnOrder]);
  const columnDefinitions = useMemo<ColumnDef<typeof dataTableFeatures, Row, unknown>[]>(() => columns.map((definition) => ({
    id: definition.id,
    accessorFn: (row: Row) => definition.accessor == null ? null : row[definition.accessor],
    header: () => definition.header,
    cell: ({ row }) => definition.render
      ? definition.render(row.original, {
        column: definition,
        row: row.original,
        rowIndex: row.getDisplayIndex(),
        rowKey: getRowKey(row.original)
      })
      : definition.accessor == null ? null : row.original[definition.accessor] as ReactNode,
    enableHiding: definition.hideable !== false,
    enablePinning: false,
    enableSorting: definition.sortable === true && hasSorting,
    maxSize: definition.maxWidth ?? 640,
    minSize: definition.minWidth ?? 64,
    size: definition.width ?? DEFAULT_COLUMN_WIDTH
  })), [columns, getRowKey, hasSorting]);
  const columnById = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);
  const columnPinning = useMemo(
    () => resolveNonOverlappingColumnPinning({
      columns,
      minimumScrollFlowInlineSize: MINIMUM_SCROLL_FLOW_WIDTH,
      order: controlledColumnOrder,
      requested: pinnedColumnIds,
      reservedStartInlineSize: leadingWidth,
      sizing: columnSizing,
      viewportInlineSize,
      visibility: columnVisibility
    }),
    [columnSizing, columnVisibility, columns, controlledColumnOrder, leadingWidth, pinnedColumnIds, viewportInlineSize]
  );
  const requestedColumnPinning = useMemo(
    () => getControlledColumnPinning(columns, controlledColumnOrder, pinnedColumnIds, columnVisibility),
    [columnVisibility, columns, controlledColumnOrder, pinnedColumnIds]
  );
  const pinningFallback = columnPinning.start.length !== requestedColumnPinning.start.length
    || columnPinning.end.length !== requestedColumnPinning.end.length;
  const sorting = useMemo<SortingState>(() => sort ? [{ id: sort.columnId, desc: sort.direction === "desc" }] : [], [sort]);
  const expanded = useMemo<ExpandedState>(() => Object.fromEntries(
    controlledExpandedRowKeys.map((key) => [getDataTableRowId(key), true])
  ), [controlledExpandedRowKeys]);

  const table = useTable<typeof dataTableFeatures, Row>({
    features: dataTableFeatures,
    columns: columnDefinitions,
    data: rows,
    getRowId: (row) => getDataTableRowId(getRowKey(row)),
    enableMultiSort: false,
    enableSortingRemoval: true,
    manualSorting: true,
    manualExpanding: true,
    getRowCanExpand: () => hasExpansion,
    state: {
      columnOrder: controlledColumnOrder,
      columnPinning,
      columnSizing: columnSizing ?? EMPTY_COLUMN_SIZING,
      columnVisibility: columnVisibility ?? EMPTY_COLUMN_VISIBILITY,
      expanded,
      sorting
    },
    onColumnOrderChange: (updater) => onColumnOrderChange?.(
      typeof updater === "function" ? updater(controlledColumnOrder) : updater
    ),
    onColumnPinningChange: () => undefined,
    onColumnSizingChange: (updater) => {
      const current = columnSizing ?? EMPTY_COLUMN_SIZING;
      onColumnSizingChange?.(typeof updater === "function" ? updater(current) : updater);
    },
    onColumnVisibilityChange: () => undefined,
    onExpandedChange: (updater) => {
      if (!onExpandedRowKeysChange) return;
      const next = typeof updater === "function" ? updater(expanded) : updater;
      const loadedById = new Map(rows.map((row) => [getDataTableRowId(getRowKey(row)), getRowKey(row)]));
      const unloaded = controlledExpandedRowKeys.filter((key) => !loadedById.has(getDataTableRowId(key)));
      const loaded = next === true
        ? Array.from(loadedById.values())
        : Object.keys(next).filter((id) => next[id]).flatMap((id) => {
          const key = loadedById.get(id);
          return key == null ? [] : [key];
        });
      onExpandedRowKeysChange([...unloaded, ...loaded]);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      onSortChange?.(first ? { columnId: first.id, direction: first.desc ? "desc" : "asc" } : null);
    }
  });

  const [grabbedColumn, setGrabbedColumn] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const reorderInstructionsId = useId();
  const dragColumn = useRef<string | null>(null);
  const activeResizeCleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => activeResizeCleanup.current?.(), []);
  const pageKeys = useMemo(() => rows.map(getRowKey), [rows, getRowKey]);
  const selectedOnPage = pageKeys.filter((key) => isSelected(selection, key)).length;
  const allPageSelected = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
  const partiallySelected = selectedOnPage > 0 && !allPageSelected;
  const visibleColumns = table.getVisibleLeafColumns();
  const totalColumnCount = visibleColumns.length + (hasSelection ? 1 : 0) + (hasExpansion ? 1 : 0);
  const stickyStartColumns = table.getStartVisibleLeafColumns();
  const stickyEndColumns = table.getEndVisibleLeafColumns();
  const stickyStartEdgeId = stickyStartColumns.at(-1)?.id;
  const stickyEndEdgeId = stickyEndColumns.at(0)?.id;
  const specialColumnIsStartEdge = stickyStartEdgeId == null;

  const togglePage = (checked: boolean) => {
    if (!selection || !onSelectionChange) return;
    if (selection.mode === "explicit") {
      const selectedKeys = checked
        ? Array.from(new Set([...selection.selectedKeys, ...pageKeys]))
        : selection.selectedKeys.filter((key) => !includesKey(pageKeys, key));
      onSelectionChange({ mode: "explicit", selectedKeys });
    } else {
      const excludedKeys = checked
        ? selection.excludedKeys.filter((key) => !includesKey(pageKeys, key))
        : Array.from(new Set([...selection.excludedKeys, ...pageKeys]));
      onSelectionChange({ mode: "all", excludedKeys });
    }
  };

  const toggleRow = (key: Key, checked: boolean) => {
    if (!selection || !onSelectionChange) return;
    if (selection.mode === "explicit") {
      onSelectionChange({
        mode: "explicit",
        selectedKeys: checked
          ? Array.from(new Set([...selection.selectedKeys, key]))
          : selection.selectedKeys.filter((selectedKey) => selectedKey !== key)
      });
    } else {
      onSelectionChange({
        mode: "all",
        excludedKeys: checked
          ? selection.excludedKeys.filter((excludedKey) => excludedKey !== key)
          : Array.from(new Set([...selection.excludedKeys, key]))
      });
    }
  };

  const commitReorder = (sourceId: string, targetId: string) => {
    const order = reorderColumnInZone(columns, controlledColumnOrder, sourceId, targetId);
    if (!order || !onColumnOrderChange) {
      setAnnouncement("Столбец нельзя переместить в другую закреплённую зону");
      return;
    }
    table.setColumnOrder(order);
    const target = columns.find((column) => column.id === targetId);
    setAnnouncement(`Столбец перемещён к ${target ? getColumnLabel(target) : "соседнему столбцу"}`);
  };

  const handleReorderKeyDown = (event: KeyboardEvent<HTMLButtonElement>, columnId: string) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setGrabbedColumn((current) => current === columnId ? null : columnId);
      setAnnouncement(grabbedColumn === columnId ? "Столбец размещён" : "Столбец захвачен");
      return;
    }
    if (event.key === "Escape" && grabbedColumn === columnId) {
      setGrabbedColumn(null);
      setAnnouncement("Перемещение отменено");
      return;
    }
    if (grabbedColumn === columnId && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      const index = visibleColumns.findIndex((column) => column.id === columnId);
      const target = visibleColumns[index + (event.key === "ArrowLeft" ? -1 : 1)];
      if (target) commitReorder(columnId, target.id);
    }
  };

  const setColumnSize = (columnId: string, width: number) => {
    table.setColumnSizing((current: ColumnSizingState) => ({ ...current, [columnId]: width }));
  };

  // TanStack owns committed columnSizing. The DS renderer owns this Pointer Events
  // gesture so its 24px handle, pointer cancellation and keyboard separator stay one contract.
  const startResize = (event: PointerEvent<HTMLDivElement>, definition: DataTableColumn<Row>, currentWidth: number) => {
    event.preventDefault();
    activeResizeCleanup.current?.();
    event.currentTarget.setPointerCapture(event.pointerId);
    const handle = event.currentTarget;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const rtl = getComputedStyle(handle).direction === "rtl";
    const move = (moveEvent: globalThis.PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const direction = rtl ? -1 : 1;
      const width = Math.min(Math.max(currentWidth + (moveEvent.clientX - startX) * direction, definition.minWidth ?? 64), definition.maxWidth ?? 640);
      setColumnSize(definition.id, Math.round(width));
    };
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      handle.removeEventListener("lostpointercapture", cleanup);
      if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
      if (activeResizeCleanup.current === cleanup) activeResizeCleanup.current = null;
    };
    const end = (endEvent: globalThis.PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      cleanup();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    handle.addEventListener("lostpointercapture", cleanup, { once: true });
    activeResizeCleanup.current = cleanup;
  };

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLDivElement>, definition: DataTableColumn<Row>, currentWidth: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const rtlMultiplier = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
    const direction = (event.key === "ArrowRight" ? 1 : -1) * rtlMultiplier;
    const width = Math.min(Math.max(currentWidth + direction * 8, definition.minWidth ?? 64), definition.maxWidth ?? 640);
    setColumnSize(definition.id, width);
  };

  return (
    <div className={classNames("ds-data-table", className)} data-refreshing={refreshing || undefined}>
      {refreshing && <div aria-label="Обновление данных" className="ds-data-table-refresh" role="status"><Spinner size="sm" /></div>}
      <TableScrollContainer data-pinning-fallback={pinningFallback || undefined} ref={scrollContainerRef} style={scrollAreaMaxBlockSize == null ? undefined : { maxBlockSize: scrollAreaMaxBlockSize }}>
        <Table aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} data-sticky-header={stickyHeader || undefined} density={density}>
          {caption && <caption className="ds-data-table-caption">{caption}</caption>}
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {hasSelection && (
                  <TableHeaderCell className="ds-table-selection-cell" data-sticky-edge={specialColumnIsStartEdge && !hasExpansion ? "true" : undefined} sticky="start" style={columnStyle(SPECIAL_COLUMN_WIDTH, 0)}>
                    <Checkbox aria-label="Выбрать строки на странице" checked={allPageSelected} indeterminate={partiallySelected} onChange={togglePage} size="sm" />
                  </TableHeaderCell>
                )}
                {hasExpansion && <TableHeaderCell aria-label="Развёрнутые строки" className="ds-table-expand-cell" data-sticky-edge={specialColumnIsStartEdge ? "true" : undefined} sticky="start" style={columnStyle(SPECIAL_COLUMN_WIDTH, hasSelection ? SPECIAL_COLUMN_WIDTH : 0)} />}
                {headerGroup.headers.map((header) => {
                  const column = header.column;
                  const definition = columnById.get(column.id);
                  if (!definition) return null;
                  const pinned = column.getIsPinned();
                  const width = column.getSize();
                  const stickyOffset = pinned === "start"
                    ? leadingWidth + column.getStart("start")
                    : pinned === "end" ? column.getAfter("end") : null;
                  const canSort = column.getCanSort();
                  const direction = canSort ? column.getIsSorted() : false;
                  return (
                    <TableHeaderCell
                      align={definition.align ?? "start"}
                      aria-sort={canSort ? (direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none") : undefined}
                      colSpan={header.colSpan}
                      data-sticky-edge={column.id === stickyStartEdgeId || column.id === stickyEndEdgeId ? "true" : undefined}
                      draggable={false}
                      key={header.id}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => { if (dragColumn.current) commitReorder(dragColumn.current, column.id); dragColumn.current = null; }}
                      {...(pinned ? { sticky: pinned } : {})}
                      style={columnStyle(width, stickyOffset)}
                    >
                      <div className="ds-data-table-header-content">
                        {definition.reorderable !== false && onColumnOrderChange && (
                          <button
                            aria-describedby={reorderInstructionsId}
                            aria-label={`Переместить столбец ${getColumnLabel(definition)}`}
                            aria-pressed={grabbedColumn === column.id}
                            className="ds-table-header-action"
                            data-table-drag-handle=""
                            draggable
                            onDragEnd={() => { dragColumn.current = null; }}
                            onDragStart={() => { dragColumn.current = column.id; }}
                            onKeyDown={(event) => handleReorderKeyDown(event, column.id)}
                            type="button"
                          ><GripVertical aria-hidden="true" className="ds-table-icon" /></button>
                        )}
                        {canSort ? (
                          <button className="ds-table-sort" onClick={() => table.setSorting(() => {
                            const next = nextSort(sort, column.id);
                            return next ? [{ id: next.columnId, desc: next.direction === "desc" }] : [];
                          })} type="button">
                            <span className="ds-data-table-header-label">{table.FlexRender({ header })}</span>
                            <span aria-hidden="true" className="ds-data-table-sort-indicator">{direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}</span>
                          </button>
                        ) : <span className="ds-data-table-header-label">{table.FlexRender({ header })}</span>}
                        {definition.resizable && onColumnSizingChange && (
                          <div
                            aria-label={`Изменить ширину столбца ${getColumnLabel(definition)}`}
                            aria-orientation="vertical"
                            aria-valuemax={definition.maxWidth ?? 640}
                            aria-valuemin={definition.minWidth ?? 64}
                            aria-valuenow={width}
                            className="ds-table-resize"
                            data-table-resize-handle=""
                            onKeyDown={(event) => resizeWithKeyboard(event, definition, width)}
                            onPointerDown={(event) => startResize(event, definition, width)}
                            role="separator"
                            tabIndex={0}
                          />
                        )}
                      </div>
                    </TableHeaderCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableEmpty colSpan={Math.max(totalColumnCount, 1)}><Spinner label="Загрузка данных" /></TableEmpty></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableEmpty colSpan={Math.max(totalColumnCount, 1)}>{noResultsState ?? emptyState}</TableEmpty></TableRow>
            ) : table.getRowModel().rows.map((tableRow) => {
              const row = tableRow.original;
              const key = getRowKey(row);
              const selected = isSelected(selection, key);
              const expandedRow = tableRow.getIsExpanded();
              return (
                <DataTableRowFragment key={tableRow.id}>
                  <TableRow
                    aria-selected={selection ? selected : undefined}
                    data-selected={selected || undefined}
                  >
                    {hasSelection && <TableSelectionCell data-sticky-edge={specialColumnIsStartEdge && !hasExpansion ? "true" : undefined} sticky="start" style={columnStyle(SPECIAL_COLUMN_WIDTH, 0)}><Checkbox aria-label={`Выбрать строку ${String(key)}`} checked={selected} onChange={(checked) => toggleRow(key, checked)} size="sm" /></TableSelectionCell>}
                    {hasExpansion && (
                      <TableExpandCell data-sticky-edge={specialColumnIsStartEdge ? "true" : undefined} sticky="start" style={columnStyle(SPECIAL_COLUMN_WIDTH, hasSelection ? SPECIAL_COLUMN_WIDTH : 0)}>
                        <button
                          aria-expanded={expandedRow}
                          aria-label={expandedRow ? "Свернуть строку" : "Развернуть строку"}
                          className="ds-data-table-expand"
                          data-table-expand=""
                          onClick={() => tableRow.toggleExpanded()}
                          type="button"
                        >{expandedRow ? <ChevronDown aria-hidden="true" className="ds-table-icon" /> : <ChevronRight aria-hidden="true" className="ds-table-icon" />}</button>
                      </TableExpandCell>
                    )}
                    {tableRow.getVisibleCells().map((cell) => {
                      const column = cell.column;
                      const definition = columnById.get(column.id);
                      if (!definition) return null;
                      const pinned = column.getIsPinned();
                      const stickyOffset = pinned === "start"
                        ? leadingWidth + column.getStart("start")
                        : pinned === "end" ? column.getAfter("end") : null;
                      return (
                        <TableCell
                          align={definition.align ?? "start"}
                          data-sticky-edge={column.id === stickyStartEdgeId || column.id === stickyEndEdgeId ? "true" : undefined}
                          key={cell.id}
                          overflow={definition.overflow ?? "wrap"}
                          {...(pinned ? { sticky: pinned } : {})}
                          style={columnStyle(column.getSize(), stickyOffset)}
                        ><span className="ds-table-cell-content">{table.FlexRender({ cell })}</span></TableCell>
                      );
                    })}
                  </TableRow>
                  {expandedRow && <TableRow data-expanded-row=""><TableCell colSpan={totalColumnCount}><div className="ds-data-table-expanded">{renderExpandedRow?.(row)}</div></TableCell></TableRow>}
                </DataTableRowFragment>
              );
            })}
          </TableBody>
        </Table>
      </TableScrollContainer>
      <span className="ds-data-table-live" id={reorderInstructionsId}>Пробел — захватить столбец, стрелки — переместить внутри зоны, Enter — разместить, Escape — отменить.</span>
      <span aria-live="polite" className="ds-data-table-live">{announcement}</span>
    </div>
  );
}

function getColumnLabel<Row>(column: DataTableColumn<Row>): string {
  if (column.headerLabel) return column.headerLabel;
  if (typeof column.header === "string" || typeof column.header === "number") return String(column.header);
  return "безымянный столбец";
}

function DataTableRowFragment({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
