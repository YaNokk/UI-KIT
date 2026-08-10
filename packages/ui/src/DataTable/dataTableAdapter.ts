import type { DataTableColumn, DataTablePinnedColumnIds, DataTableRowKey } from "./types.js";

export const EMPTY_COLUMN_ORDER: string[] = [];
export const EMPTY_COLUMN_SIZING: Record<string, number> = {};
export const EMPTY_COLUMN_VISIBILITY: Record<string, boolean> = {};

export function getDataTableRowId(key: DataTableRowKey): string {
  return `${typeof key === "number" ? "number" : "string"}:${String(key)}`;
}

export function getColumnZone<Row>(column: DataTableColumn<Row>): "start" | "center" | "end" {
  return column.sticky ?? "center";
}

export function getCompleteColumnOrder<Row>(columns: DataTableColumn<Row>[], order?: string[]): string[] {
  const knownIds = new Set(columns.map((column) => column.id));
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const id of order ?? EMPTY_COLUMN_ORDER) {
    if (!knownIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    normalized.push(id);
  }
  for (const column of columns) {
    if (seen.has(column.id)) continue;
    seen.add(column.id);
    normalized.push(column.id);
  }
  return normalized;
}

export function getControlledColumnPinning<Row>(
  columns: DataTableColumn<Row>[],
  order: string[],
  requested?: DataTablePinnedColumnIds,
  visibility?: Record<string, boolean>
) {
  const byId = new Map(columns.map((column) => [column.id, column]));
  const requestedStart = requested?.start == null ? null : new Set(requested.start);
  const requestedEnd = requested?.end == null ? null : new Set(requested.end);
  return {
    start: order.filter((id) => visibility?.[id] !== false && byId.get(id)?.sticky === "start" && (requestedStart == null || requestedStart.has(id))),
    end: order.filter((id) => visibility?.[id] !== false && byId.get(id)?.sticky === "end" && (requestedEnd == null || requestedEnd.has(id)))
  };
}

interface ResolveNonOverlappingPinningOptions<Row> {
  columns: DataTableColumn<Row>[];
  order: string[];
  requested?: DataTablePinnedColumnIds | undefined;
  visibility?: Record<string, boolean> | undefined;
  sizing?: Record<string, number> | undefined;
  viewportInlineSize: number | null;
  reservedStartInlineSize: number;
  minimumScrollFlowInlineSize: number;
}

function getColumnInlineSize<Row>(column: DataTableColumn<Row>, sizing?: Record<string, number>): number {
  const minimum = column.minWidth ?? 64;
  const maximum = column.maxWidth ?? 640;
  return Math.min(Math.max(sizing?.[column.id] ?? column.width ?? 160, minimum), maximum);
}

export function resolveNonOverlappingColumnPinning<Row>({
  columns,
  order,
  requested,
  visibility,
  sizing,
  viewportInlineSize,
  reservedStartInlineSize,
  minimumScrollFlowInlineSize
}: ResolveNonOverlappingPinningOptions<Row>) {
  if (viewportInlineSize == null) return { start: [], end: [] };
  const byId = new Map(columns.map((column) => [column.id, column]));
  const desired = getControlledColumnPinning(columns, order, requested, visibility);
  let available = Math.max(viewportInlineSize - reservedStartInlineSize - minimumScrollFlowInlineSize, 0);
  const start: string[] = [];
  for (const id of desired.start) {
    const column = byId.get(id);
    if (!column || visibility?.[id] === false) continue;
    const size = getColumnInlineSize(column, sizing);
    if (size > available) break;
    start.push(id);
    available -= size;
  }

  const end: string[] = [];
  for (let index = desired.end.length - 1; index >= 0; index -= 1) {
    const id = desired.end[index];
    if (id == null) continue;
    const column = byId.get(id);
    if (!column || visibility?.[id] === false) continue;
    const size = getColumnInlineSize(column, sizing);
    if (size > available) break;
    end.unshift(id);
    available -= size;
  }
  return { start, end };
}

export function reorderDataTableColumn<Row>(
  columns: DataTableColumn<Row>[],
  currentOrder: string[] | undefined,
  sourceId: string,
  targetId: string
): string[] | null {
  const byId = new Map(columns.map((column) => [column.id, column]));
  const source = byId.get(sourceId);
  const target = byId.get(targetId);
  if (!source || !target || source.reorderable === false || getColumnZone(source) !== getColumnZone(target)) return null;

  const order = getCompleteColumnOrder(columns, currentOrder);
  const from = order.indexOf(sourceId);
  const to = order.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return order;
  order.splice(from, 1);
  order.splice(to, 0, sourceId);
  return order;
}
