import { type DragEvent, type ReactNode, useRef } from "react";
import {
  Button,
  Checkbox,
  type DataTableColumn,
  type DataTableRowKey,
  type DataTableSelection
} from "@mypoint/ui";
import "./DataTablePatterns.css";

export interface DataTableColumnSettingsProps<Row> {
  columns: DataTableColumn<Row>[];
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  onColumnOrderChange: (order: string[]) => void;
  onColumnVisibilityChange: (value: Record<string, boolean>) => void;
  onReset: () => void;
}

function zone<Row>(column: DataTableColumn<Row>): "start" | "normal" | "end" {
  return column.sticky ?? "normal";
}

export function DataTableColumnSettings<Row>({
  columns,
  columnOrder,
  columnVisibility,
  onColumnOrderChange,
  onColumnVisibilityChange,
  onReset
}: DataTableColumnSettingsProps<Row>) {
  const dragged = useRef<string | null>(null);
  const byId = new Map(columns.map((column) => [column.id, column]));
  const ordered = [...columnOrder.filter((id) => byId.has(id)), ...columns.map((column) => column.id).filter((id) => !columnOrder.includes(id))];
  const move = (source: string, target: string) => {
    const sourceColumn = byId.get(source);
    const targetColumn = byId.get(target);
    if (!sourceColumn || !targetColumn || sourceColumn.reorderable === false || zone(sourceColumn) !== zone(targetColumn)) return;
    const next = [...ordered];
    next.splice(next.indexOf(source), 1);
    next.splice(next.indexOf(target), 0, source);
    onColumnOrderChange(next);
  };
  const drop = (event: DragEvent, target: string) => {
    event.preventDefault();
    if (dragged.current) move(dragged.current, target);
    dragged.current = null;
  };

  return (
    <section aria-label="Настройка столбцов" className="ds-column-settings">
      <ol className="ds-column-settings-list">
        {ordered.map((id, index) => {
          const column = byId.get(id);
          if (!column) return null;
          const previousId = ordered[index - 1];
          const nextId = ordered[index + 1];
          const previousColumn = previousId == null ? undefined : byId.get(previousId);
          const nextColumn = nextId == null ? undefined : byId.get(nextId);
          const sameZonePrevious = previousColumn != null && zone(previousColumn) === zone(column);
          const sameZoneNext = nextColumn != null && zone(nextColumn) === zone(column);
          return (
            <li draggable={column.reorderable !== false} key={id} onDragOver={(event) => event.preventDefault()} onDragStart={() => { dragged.current = id; }} onDrop={(event) => drop(event, id)}>
              <span className="ds-column-settings-grip" data-table-drag-handle="" title="Перетащить">⋮⋮</span>
              <Checkbox
                checked={columnVisibility[id] !== false}
                disabled={column.hideable === false}
                label={column.header}
                onChange={(checked) => onColumnVisibilityChange({ ...columnVisibility, [id]: checked })}
                size="sm"
              />
              <div className="ds-column-settings-actions">
                <button aria-label={`Переместить ${id} влево`} disabled={!sameZonePrevious} onClick={() => { if (previousId) move(id, previousId); }} type="button">←</button>
                <button aria-label={`Переместить ${id} вправо`} disabled={!sameZoneNext} onClick={() => { if (nextId) move(id, nextId); }} type="button">→</button>
              </div>
            </li>
          );
        })}
      </ol>
      <Button onClick={onReset} size="sm" variant="secondary">Сбросить</Button>
    </section>
  );
}

export interface DataTableSelectionBarProps<Key extends DataTableRowKey = DataTableRowKey> {
  selection: DataTableSelection<Key>;
  pageSelectedCount: number;
  matchingTotal: number;
  onSelectionChange: (selection: DataTableSelection<Key>) => void;
  actions?: ReactNode;
}

export function DataTableSelectionBar<Key extends DataTableRowKey>({ selection, pageSelectedCount, matchingTotal, onSelectionChange, actions }: DataTableSelectionBarProps<Key>) {
  const all = selection.mode === "all";
  return (
    <aside aria-live="polite" className="ds-selection-bar">
      <span>{all ? `Выбраны все ${matchingTotal.toLocaleString("ru-RU")} записей.` : `На странице выбрано: ${pageSelectedCount}.`}</span>
      {!all && matchingTotal > pageSelectedCount && <button onClick={() => onSelectionChange({ mode: "all", excludedKeys: [] })} type="button">Выбрать все {matchingTotal.toLocaleString("ru-RU")}</button>}
      <button onClick={() => onSelectionChange({ mode: "explicit", selectedKeys: [] })} type="button">Очистить выбор</button>
      {actions && <div className="ds-selection-bar-actions">{actions}</div>}
    </aside>
  );
}

export interface ResponsiveDataViewProps {
  table: ReactNode;
  cards: ReactNode;
  className?: string;
}

export function ResponsiveDataView({ table, cards, className }: ResponsiveDataViewProps) {
  return <div className={className}><div className="ds-responsive-data-table">{table}</div><div className="ds-responsive-data-cards">{cards}</div></div>;
}
