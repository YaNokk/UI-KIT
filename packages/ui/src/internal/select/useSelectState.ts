import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode
} from "react";
import { useResolvedLocale } from "../locale/LocaleContext";
import {
  normalizeSelectCollection,
  type SelectCollection,
  type SelectCollectionItem,
  type SelectNavigableRow
} from "./collection";
import { createTypeaheadMatcher } from "./typeahead";
import type { SelectCollectionState } from "./types";

const TYPEAHEAD_RESET_MS = 700;

export type SelectResolvedStatus =
  | "ready"
  | "loading"
  | "loading-more"
  | "empty"
  | "error";

export type SelectCommit<Value extends string> = (
  row: SelectNavigableRow<Value>
) => void;

export interface UseSelectStateOptions<Value extends string> {
  items: readonly SelectCollectionItem<Value>[];
  collectionState?: SelectCollectionState | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale?: string | undefined;
}

export interface SelectStateController<Value extends string> {
  collection: SelectCollection<Value>;
  status: SelectResolvedStatus;
  statusMessage: ReactNode;
  onRetry: (() => void) | undefined;
  open: boolean;
  requestOpenChange: (open: boolean) => void;
  activeRow: SelectNavigableRow<Value> | null;
  setActiveRow: (row: SelectNavigableRow<Value> | null) => void;
  openWithSelection: (
    preferredValues: readonly Value[],
    fromEnd?: boolean
  ) => void;
  handleTriggerKeyDown: (
    event: KeyboardEvent,
    commit: SelectCommit<Value>
  ) => void;
  handleListKeyDown: (
    event: KeyboardEvent,
    commit: SelectCommit<Value>
  ) => void;
}

export function useSelectState<Value extends string>({
  items,
  collectionState,
  open,
  onOpenChange,
  locale
}: UseSelectStateOptions<Value>): SelectStateController<Value> {
  const resolvedLocale = useResolvedLocale(locale);
  const collection = useMemo(
    () => normalizeSelectCollection(items),
    [items]
  );
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const typeaheadBuffer = useRef("");
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status: SelectResolvedStatus = (() => {
    const state = collectionState?.status ?? "ready";
    if (state !== "ready") return state;
    return collection.optionCount === 0 ? "empty" : "ready";
  })();
  const statusMessage = collectionState?.message ?? null;

  const activeRow = useMemo(() => {
    if (activeRowId === null) return null;
    return (
      collection.navigableRows.find((row) => row.rowId === activeRowId)
        ?? null
    );
  }, [collection, activeRowId]);

  const setActiveRow = useCallback(
    (row: SelectNavigableRow<Value> | null) => {
      setActiveRowId(row?.rowId ?? null);
    },
    []
  );

  const requestOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const findInitialActiveRow = useCallback(
    (preferredValues: readonly Value[]): SelectNavigableRow<Value> | null => {
      for (const value of preferredValues) {
        const row = collection.optionRowByValue.get(value);
        if (row && !row.disabled) return row;
      }
      return (
        collection.navigableRows.find((row) => row.type === "option")
          ?? collection.navigableRows[0]
          ?? null
      );
    },
    [collection]
  );

  const openWithSelection = useCallback(
    (preferredValues: readonly Value[], fromEnd = false) => {
      const initial = fromEnd
        ? (collection.navigableRows.at(-1) ?? null)
        : findInitialActiveRow(preferredValues);
      setActiveRowId(initial?.rowId ?? null);
      if (!open) requestOpenChange(true);
    },
    [collection, findInitialActiveRow, open, requestOpenChange]
  );

  const moveActive = useCallback(
    (direction: 1 | -1 | "first" | "last") => {
      const rows = collection.navigableRows;
      if (rows.length === 0) return;
      let nextIndex: number;
      const currentIndex = activeRow
        ? rows.findIndex((row) => row.rowId === activeRow.rowId)
        : -1;
      if (direction === "first") {
        nextIndex = 0;
      } else if (direction === "last") {
        nextIndex = rows.length - 1;
      } else if (currentIndex === -1) {
        nextIndex = direction === 1 ? 0 : rows.length - 1;
      } else {
        nextIndex = (currentIndex + direction + rows.length) % rows.length;
      }
      setActiveRowId(rows[nextIndex]?.rowId ?? null);
    },
    [activeRow, collection]
  );

  const clearTypeahead = useCallback(() => {
    typeaheadBuffer.current = "";
    if (typeaheadTimer.current !== null) {
      clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = null;
    }
  }, []);

  useEffect(() => clearTypeahead, [clearTypeahead]);

  // Deterministic active-row reconciliation when the collection refreshes:
  // preserve identity if still enabled, otherwise move to the first option.
  useEffect(() => {
    if (activeRowId === null) return;
    const stillExists = collection.navigableRows.some(
      (row) => row.rowId === activeRowId
    );
    if (stillExists) return;
    setActiveRowId(
      collection.navigableRows.find((row) => row.type === "option")?.rowId
        ?? collection.navigableRows[0]?.rowId
        ?? null
    );
  }, [collection, activeRowId]);

  const handleTypeaheadChar = useCallback(
    (char: string) => {
      typeaheadBuffer.current += char;
      if (typeaheadTimer.current !== null) {
        clearTimeout(typeaheadTimer.current);
      }
      typeaheadTimer.current = setTimeout(() => {
        typeaheadBuffer.current = "";
        typeaheadTimer.current = null;
      }, TYPEAHEAD_RESET_MS);

      const matcher = createTypeaheadMatcher(resolvedLocale);
      const match = matcher(
        collection as SelectCollection<string>,
        typeaheadBuffer.current,
        activeRow ? activeRow.navigableIndex : null
      );
      if (match) setActiveRowId(match.rowId);
    },
    [activeRow, collection, resolvedLocale]
  );

  const handleOpenKeyDown = useCallback(
    (event: KeyboardEvent, commit: SelectCommit<Value>) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveActive(1);
          return;
        case "ArrowUp":
          event.preventDefault();
          moveActive(-1);
          return;
        case "Home":
          event.preventDefault();
          moveActive("first");
          return;
        case "End":
          event.preventDefault();
          moveActive("last");
          return;
        case "Enter":
        case " ":
          event.preventDefault();
          if (activeRow) commit(activeRow);
          return;
        case "Tab":
          requestOpenChange(false);
          return;
        default:
          if (
            event.key.length === 1
            && !event.altKey
            && !event.ctrlKey
            && !event.metaKey
          ) {
            event.preventDefault();
            handleTypeaheadChar(event.key);
          }
      }
    },
    [activeRow, handleTypeaheadChar, moveActive, requestOpenChange]
  );

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent, commit: SelectCommit<Value>) => {
      if (!open) {
        switch (event.key) {
          case "Enter":
          case " ":
          case "ArrowDown":
            event.preventDefault();
            requestOpenChange(true);
            return;
          case "ArrowUp":
            event.preventDefault();
            openWithSelection([], true);
            return;
          default:
            return;
        }
      }
      handleOpenKeyDown(event, commit);
    },
    [handleOpenKeyDown, open, openWithSelection, requestOpenChange]
  );

  return {
    collection,
    status,
    statusMessage,
    onRetry: collectionState?.onRetry,
    open,
    requestOpenChange,
    activeRow,
    setActiveRow,
    openWithSelection,
    handleTriggerKeyDown,
    handleListKeyDown: handleOpenKeyDown
  };
}
