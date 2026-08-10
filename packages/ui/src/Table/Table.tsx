import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes
} from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { classNames } from "../shared/classNames.js";
import "./Table.css";

export type TableDensity = "default" | "compact";
export type TableColumnAlign = "start" | "center" | "end";
export type TableSortDirection = "asc" | "desc";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  density?: TableDensity;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, density = "default", ...props }, ref
) {
  return <table {...props} className={classNames("ds-table", className)} data-density={density} ref={ref} />;
});

export const TableScrollContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TableScrollContainer({ className, ...props }, ref) {
    return <div {...props} className={classNames("ds-table-scroll", className)} ref={ref} />;
  }
);

export const TableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHead({ className, ...props }, ref) {
    return <thead {...props} className={classNames("ds-table-head", className)} ref={ref} />;
  }
);

export interface TableHeaderCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: TableColumnAlign;
  sticky?: "start" | "end";
}

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell({ align = "start", className, sticky, ...props }, ref) {
    return <th {...props} className={classNames("ds-table-header-cell", className)} data-align={align} data-sticky={sticky} ref={ref} />;
  }
);

export interface TableSortableHeaderCellProps extends TableHeaderCellProps {
  direction?: TableSortDirection;
  label: React.ReactNode;
  onSort: () => void;
}

export const TableSortableHeaderCell = forwardRef<HTMLTableCellElement, TableSortableHeaderCellProps>(
  function TableSortableHeaderCell({ direction, label, onSort, ...props }, ref) {
    const Icon = direction === "asc" ? ChevronUp : direction === "desc" ? ChevronDown : ChevronsUpDown;
    return (
      <TableHeaderCell {...props} aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"} ref={ref}>
        <button className="ds-table-sort" onClick={onSort} type="button">
          <span>{label}</span><Icon aria-hidden="true" className="ds-table-icon" />
        </button>
      </TableHeaderCell>
    );
  }
);

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className, ...props }, ref) {
    return <tbody {...props} className={classNames("ds-table-body", className)} ref={ref} />;
  }
);

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className, ...props }, ref) {
    return <tr {...props} className={classNames("ds-table-row", className)} ref={ref} />;
  }
);

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: TableColumnAlign;
  overflow?: "wrap" | "truncate" | "visible";
  sticky?: "start" | "end";
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ align = "start", className, overflow = "wrap", sticky, ...props }, ref) {
    return <td {...props} className={classNames("ds-table-cell", className)} data-align={align} data-overflow={overflow} data-sticky={sticky} ref={ref} />;
  }
);

export const TableSelectionCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableSelectionCell({ className, ...props }, ref) {
    return <TableCell {...props} className={classNames("ds-table-selection-cell", className)} ref={ref} />;
  }
);

export const TableExpandCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableExpandCell({ className, ...props }, ref) {
    return <TableCell {...props} className={classNames("ds-table-expand-cell", className)} ref={ref} />;
  }
);

export interface TableEmptyProps extends TdHTMLAttributes<HTMLTableCellElement> {
  colSpan: number;
}

export const TableEmpty = forwardRef<HTMLTableCellElement, TableEmptyProps>(
  function TableEmpty({ className, ...props }, ref) {
    return <td {...props} className={classNames("ds-table-empty", className)} ref={ref} />;
  }
);
