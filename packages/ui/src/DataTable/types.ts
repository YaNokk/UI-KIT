import type { ReactNode } from "react";

export type DataTableRowKey = string | number;
export type DataTableColumnAlign = "start" | "center" | "end";
export type DataTableStickySide = "start" | "end";
export type DataTableCellOverflow = "wrap" | "truncate" | "visible";

export interface DataTablePinnedColumnIds {
  start?: readonly string[];
  end?: readonly string[];
}

export interface DataTableCellContext<Row> {
  column: DataTableColumn<Row>;
  row: Row;
  rowIndex: number;
  rowKey: DataTableRowKey;
}

export interface DataTableColumn<Row> {
  id: string;
  header: ReactNode;
  headerLabel?: string;
  accessor?: keyof Row;
  render?: (row: Row, context: DataTableCellContext<Row>) => ReactNode;
  align?: DataTableColumnAlign;
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  reorderable?: boolean;
  hideable?: boolean;
  sticky?: DataTableStickySide;
  overflow?: DataTableCellOverflow;
}

export interface DataTableSort {
  columnId: string;
  direction: "asc" | "desc";
}

export type DataTableSelection<Key extends DataTableRowKey = DataTableRowKey> =
  | { mode: "explicit"; selectedKeys: Key[] }
  | { mode: "all"; excludedKeys: Key[] };
