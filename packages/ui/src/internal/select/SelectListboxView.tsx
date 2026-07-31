import { Check } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type ReactNode
} from "react";
import { VList, type VListHandle } from "virtua";
import { Button } from "../../Button/Button";
import { Spinner } from "../../Spinner/Spinner";
import { classNames } from "../../shared/classNames";
import type {
  SelectNavigableRow,
  SelectRow
} from "./collection";
import type { SelectResolvedStatus } from "./useSelectState";
import type { SelectMessages } from "./types";
import styles from "./SelectListbox.module.css";

const VIRTUALIZATION_THRESHOLD = 500;

export interface SelectListboxViewProps<Value extends string> {
  rows: SelectRow<Value>[];
  status: SelectResolvedStatus;
  statusMessage: ReactNode;
  onRetry: (() => void) | undefined;
  multiple: boolean;
  activeRowId: string | null;
  selectedValues: ReadonlySet<Value>;
  messages: SelectMessages;
  listboxId: string;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  onHoverRow: (row: SelectNavigableRow<Value>) => void;
  onPickRow: (row: SelectNavigableRow<Value>) => void;
  autoFocus?: boolean;
  tabbable?: boolean;
}

interface RowContentSlots {
  leading?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
}

function RowContent({ leading, label, description, trailing }: RowContentSlots) {
  return (
    <>
      {leading == null ? null : (
        <span aria-hidden="true" className={styles.leading}>
          {leading}
        </span>
      )}
      <span className={styles.body}>
        <span className={styles.label}>{label}</span>
        {description == null ? null : (
          <span className={styles.description}>{description}</span>
        )}
      </span>
      {trailing == null ? null : (
        <span className={styles.trailing}>{trailing}</span>
      )}
    </>
  );
}

function SelectListboxViewInner<Value extends string>(
  {
    rows,
    status,
    statusMessage,
    onRetry,
    multiple,
    activeRowId,
    selectedValues,
    messages,
    listboxId,
    onKeyDown,
    onHoverRow,
    onPickRow,
    autoFocus = true,
    tabbable = false
  }: SelectListboxViewProps<Value>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const virtualRef = useRef<VListHandle>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const actionRows = useMemo(
    () => rows.filter((row): row is SelectNavigableRow<Value> & { type: "action" } => row.type === "action"),
    [rows]
  );
  const optionRows = useMemo(
    () => rows.filter((row) => row.type !== "action"),
    [rows]
  );
  const activeRowIndex = useMemo(() => {
    if (activeRowId === null) return -1;
    return optionRows.findIndex(
      (row) => row.type === "option" && row.rowId === activeRowId
    );
  }, [optionRows, activeRowId]);
  const virtualized =
    optionRows.length > VIRTUALIZATION_THRESHOLD
    && typeof ResizeObserver === "function"
    && typeof ResizeObserver.prototype?.observe === "function";
  const [mountedActiveId, setMountedActiveId] = useState<string | null>(null);

  const setListboxNode = (node: HTMLDivElement | null) => {
    listboxRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // Publish aria-activedescendant only after the virtual row actually exists.
  useEffect(() => {
    if (activeRowIndex < 0 || activeRowId === null) {
      setMountedActiveId(null);
      return;
    }
    setMountedActiveId(null);
    if (virtualized) {
      virtualRef.current?.scrollToIndex(activeRowIndex, { align: "nearest" });
    } else if (typeof document !== "undefined") {
      const row = document
        .getElementById(listboxId)
        ?.querySelector('[data-row-id="' + activeRowId + '"]');
      if (row instanceof HTMLElement) {
        row.scrollIntoView?.({ block: "nearest" });
      }
    }
    const listbox = listboxRef.current;
    const targetId = listboxId + "-" + activeRowId;
    const publishWhenMounted = () => {
      const target = document.getElementById(targetId);
      if (listbox && target && listbox.contains(target)) {
        setMountedActiveId(activeRowId);
        return true;
      }
      return false;
    };
    if (publishWhenMounted() || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => {
      if (publishWhenMounted()) observer.disconnect();
    });
    if (listbox) observer.observe(listbox, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [activeRowId, activeRowIndex, virtualized, listboxId]);

  useEffect(() => {
    if (autoFocus) listboxRef.current?.focus();
  }, [autoFocus]);

  const renderNavigableRow = (row: SelectNavigableRow<Value>) => {
    const active = row.rowId === activeRowId;
    if (row.type === "action") {
      return (
        <button
          aria-disabled={row.disabled ? true : undefined}
          className={classNames(
            styles.row,
            active && styles.active,
            row.disabled && styles.disabledRow
          )}
          data-row-id={row.rowId}
          id={listboxId + "-" + row.rowId}
          key={row.rowId}
          onMouseEnter={() => {
            if (!row.disabled) onHoverRow(row);
          }}
          onClick={() => {
            if (!row.disabled) onPickRow(row);
          }}
          type="button"
        >
          <RowContent
            description={row.action.description}
            label={row.action.label}
            leading={row.action.leading}
            trailing={row.action.trailing}
          />
        </button>
      );
    }

    const selected = selectedValues.has(row.option.value);
    const marker = multiple ? (
      <span
        aria-hidden="true"
        className={classNames(
          styles.checkboxMarker,
          selected && styles.checkboxMarkerChecked
        )}
      >
        {selected ? <Check /> : null}
      </span>
    ) : (
      <span
        aria-hidden="true"
        className={classNames(
          styles.selectedMarker,
          selected && styles.selectedMarkerVisible
        )}
      >
        <Check />
      </span>
    );

    return (
      <div
        aria-disabled={row.disabled ? true : undefined}
        aria-selected={selected}
        className={classNames(
          styles.row,
          active && styles.active,
          selected && styles.selected,
          row.disabled && styles.disabledRow
        )}
        data-row-id={row.rowId}
        id={listboxId + "-" + row.rowId}
        key={row.rowId}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => {
          if (!row.disabled) onHoverRow(row);
        }}
        onClick={() => {
          if (!row.disabled) onPickRow(row);
        }}
        role="option"
      >
        {marker}
        <RowContent
          description={row.option.description}
          label={row.option.label}
          leading={row.option.leading}
          trailing={row.option.trailing}
        />
      </div>
    );
  };

  const renderRow = (row: SelectRow<Value>) => {
    if (row.type === "group-header") {
      return (
        <div
          className={styles.groupHeader}
          id={listboxId + "-" + row.rowId}
          key={row.rowId}
          role="presentation"
        >
          {row.label}
        </div>
      );
    }
    return renderNavigableRow(row);
  };

  const statusRow = (() => {
    if (status === "loading") {
      return (
        <div className={styles.status} role="status">
          <Spinner size="sm" tone="secondary" />
          <span>{statusMessage ?? messages.loading}</span>
        </div>
      );
    }
    if (status === "empty") {
      return (
        <div className={styles.status} role="status">
          {statusMessage ?? messages.empty}
        </div>
      );
    }
    if (status === "refreshing") {
      return (
        <div className={styles.refreshing} role="status">
          <Spinner size="sm" tone="secondary" />
          <span>{statusMessage ?? messages.loading}</span>
        </div>
      );
    }
    if (status === "error") {
      return (
        <div>
          <div className={classNames(styles.status, styles.statusError)} role="alert">
            {statusMessage ?? messages.error}
          </div>
          {onRetry ? (
            <div className={styles.statusActions}>
              <Button onClick={onRetry} size="sm" variant="secondary">
                {messages.retry}
              </Button>
            </div>
          ) : null}
        </div>
      );
    }
    return null;
  })();

  const loadingMoreRow = status === "loading-more" ? (
    <div className={styles.status} key="loading-more" role="status">
      <Spinner size="sm" tone="secondary" />
      <span>{statusMessage ?? messages.loading}</span>
    </div>
  ) : null;

  const optionContent = (() => {
    if (status === "loading" || status === "empty" || status === "error") {
      return null;
    }
    if (virtualized) {
      // VList owns the one scroll container. Group labels stay as flattened
      // contextual rows here; direct rendering below keeps native ARIA groups.
      return (
      <VList ref={virtualRef} style={{ blockSize: "100%" }}>
          {optionRows.map(renderRow)}
      </VList>
      );
    }

    const content: ReactNode[] = [];
    for (let index = 0; index < optionRows.length; index += 1) {
      const row = optionRows[index];
      if (!row) continue;
      if (row.type !== "group-header") {
        content.push(renderNavigableRow(row));
        continue;
      }
      const children: ReactNode[] = [];
      let nextIndex = index + 1;
      let child = optionRows[nextIndex];
      while (child?.type === "option" && child.groupId === row.groupId) {
        children.push(renderNavigableRow(child));
        nextIndex += 1;
        child = optionRows[nextIndex];
      }
      content.push(
        <div
          aria-labelledby={listboxId + "-" + row.rowId}
          key={row.rowId}
          role="group"
        >
          <div
            className={styles.groupHeader}
            id={listboxId + "-" + row.rowId}
          >
            {row.label}
          </div>
          {children}
        </div>
      );
      index = nextIndex - 1;
    }
    return content;
  })();

  return (
    <div className={styles.root}>
      {actionRows.length > 0 ? (
        <div className={styles.actions}>
          {actionRows.map(renderNavigableRow)}
        </div>
      ) : null}
      {status === "refreshing" ? statusRow : null}
      <div
        aria-activedescendant={
          mountedActiveId ? listboxId + "-" + mountedActiveId : undefined
        }
        aria-multiselectable={multiple ? true : undefined}
        className={classNames(
          styles.scroll,
          virtualized && styles.virtualScrollHost
        )}
        id={listboxId}
        onKeyDown={onKeyDown}
        ref={setListboxNode}
        role="listbox"
        tabIndex={tabbable ? 0 : -1}
      >
        {optionContent}
      </div>
      {loadingMoreRow}
      {status === "refreshing" ? null : statusRow}
    </div>
  );
}

export const SelectListboxView = forwardRef(SelectListboxViewInner) as <
  Value extends string
>(
  props: SelectListboxViewProps<Value> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  }
) => React.ReactElement;
