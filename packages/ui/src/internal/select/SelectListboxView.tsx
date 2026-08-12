import { Check } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type ReactNode,
  type RefObject
} from "react";
import { VList, type VListHandle } from "virtua";
import { Button } from "../../Button/Button";
import { Spinner } from "../../Spinner/Spinner";
import type { ChoiceControlSize } from "../../shared/choiceControl";
import { classNames } from "../../shared/classNames";
import { scrollbarClassName } from "../../styles/scrollbar";
import { ChoiceIndicator } from "../choice-control/ChoiceControl";
import { choiceControlLabelClassName } from "../single-line-control-typography/singleLineControlTypography";
import type {
  SelectActionRow,
  SelectInteractiveRow,
  SelectOptionRow,
  SelectRow
} from "./collection";
import type { SelectResolvedStatus } from "./useSelectState";
import type { SelectMessages } from "./types";
import styles from "./SelectListbox.module.css";

const DEFAULT_VIRTUALIZATION_THRESHOLD = 500;

export interface SelectListboxViewProps<Value extends string> {
  rows: SelectRow<Value>[];
  status: SelectResolvedStatus;
  statusMessage: ReactNode;
  onRetry: (() => void) | undefined;
  multiple: boolean;
  choiceIndicatorSize?: ChoiceControlSize;
  activeRowId: string | null;
  selectedValues: ReadonlySet<Value>;
  messages: SelectMessages;
  listboxId: string;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  onHoverRow: (row: SelectOptionRow<Value>) => void;
  onPickRow: (row: SelectInteractiveRow<Value>) => void;
  firstEnabledActionRef?: RefObject<HTMLButtonElement | null>;
  autoFocus?: boolean;
  virtualizationThreshold?: number;
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
        <span className={styles.label} data-control-text-clip="">
          <span
            className={classNames(styles.labelText, choiceControlLabelClassName)}
            data-choice-control-label=""
            data-control-text-role="choiceControlLabel"
          >{label}</span>
        </span>
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
    choiceIndicatorSize = "md",
    activeRowId,
    selectedValues,
    messages,
    listboxId,
    onKeyDown,
    onHoverRow,
    onPickRow,
    firstEnabledActionRef,
    autoFocus = true,
    virtualizationThreshold = DEFAULT_VIRTUALIZATION_THRESHOLD
  }: SelectListboxViewProps<Value>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const virtualRef = useRef<VListHandle>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const { actionRows, optionRows } = useMemo(() => {
    const nextActionRows: SelectActionRow[] = [];
    const nextOptionRows: Exclude<SelectRow<Value>, SelectActionRow>[] = [];
    for (const row of rows) {
      if (row.type === "action") nextActionRows.push(row);
      else nextOptionRows.push(row);
    }
    return { actionRows: nextActionRows, optionRows: nextOptionRows };
  }, [rows]);
  const firstEnabledActionId = actionRows.find((row) => !row.disabled)?.rowId;
  const activeRowIndex = useMemo(() => {
    if (activeRowId === null) return -1;
    return optionRows.findIndex(
      (row) => row.type === "option" && row.rowId === activeRowId
    );
  }, [optionRows, activeRowId]);
  const virtualized =
    optionRows.length > virtualizationThreshold
    && !optionRows.some((row) => row.type === "group-header")
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

  const renderInteractiveRow = (row: SelectInteractiveRow<Value>) => {
    const active = row.rowId === activeRowId;
    if (row.type === "action") {
      return (
        <button
          className={classNames(
            styles.row,
            active && styles.active,
            row.disabled && styles.disabledRow
          )}
          data-row-id={row.rowId}
          disabled={row.disabled}
          id={listboxId + "-" + row.rowId}
          key={row.rowId}
          onClick={() => {
            if (!row.disabled) onPickRow(row);
          }}
          ref={row.rowId === firstEnabledActionId
            ? firstEnabledActionRef
            : undefined}
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
      <ChoiceIndicator
        checked={selected}
        className={styles.choiceIndicator}
        disabled={row.disabled}
        kind="checkbox"
        presentation="option"
        size={choiceIndicatorSize}
      />
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
          multiple && styles.multipleRow,
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
    return renderInteractiveRow(row);
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
      // Only flat option collections reach this branch. Grouped collections
      // use the regular role="group" rendering below.
      return (
        <VList
          className={scrollbarClassName()}
          data-select-scroll-owner="virtual"
          ref={virtualRef}
        >
          {optionRows.map(renderRow)}
        </VList>
      );
    }

    const content: ReactNode[] = [];
    for (let index = 0; index < optionRows.length; index += 1) {
      const row = optionRows[index];
      if (!row) continue;
      if (row.type !== "group-header") {
        content.push(renderInteractiveRow(row));
        continue;
      }
      const children: ReactNode[] = [];
      let nextIndex = index + 1;
      let child = optionRows[nextIndex];
      while (child?.type === "option" && child.groupId === row.groupId) {
        children.push(renderInteractiveRow(child));
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
    <div className={styles.root} data-select-list-root="">
      {actionRows.length > 0 ? (
        <div className={styles.actions}>
          {actionRows.map(renderInteractiveRow)}
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
          !virtualized && scrollbarClassName(),
          virtualized && styles.virtualScrollHost
        )}
        data-select-scroll-owner={virtualized ? undefined : "listbox"}
        data-select-virtualized={virtualized ? "" : undefined}
        id={listboxId}
        onKeyDown={onKeyDown}
        ref={setListboxNode}
        role="listbox"
        tabIndex={0}
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
