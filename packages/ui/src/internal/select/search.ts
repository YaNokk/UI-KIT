import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  SelectCollectionItem,
  SelectGroup,
  SelectOption,
  SelectValue
} from "./collection";
import type { SelectSearchProps } from "./types";

function isGroup<Value extends SelectValue>(
  item: SelectCollectionItem<Value>
): item is SelectGroup<Value> {
  return item.type === "group";
}

function isAction<Value extends SelectValue>(item: SelectCollectionItem<Value>) {
  return item.type === "action";
}

export function filterSelectItems<Value extends SelectValue>(
  items: readonly SelectCollectionItem<Value>[],
  query: string,
  filter?: SelectSearchProps["filter"]
): SelectCollectionItem<Value>[] {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length === 0) return [...items];
  const matches = filter
    ?? ((text: string, value: string) =>
      text.toLocaleLowerCase().includes(value.toLocaleLowerCase()));

  const filtered: SelectCollectionItem<Value>[] = [];
  for (const item of items) {
    if (isAction(item)) {
      filtered.push(item);
      continue;
    }
    if (isGroup(item)) {
      const children = item.items.filter((option) =>
        matches(option.textValue, normalizedQuery)
      );
      if (children.length > 0) filtered.push({ ...item, items: children });
      continue;
    }
    if (matches((item as SelectOption<Value>).textValue, normalizedQuery)) {
      filtered.push(item);
    }
  }
  return filtered;
}

export function useSelectSearch<Value extends SelectValue>(
  items: readonly SelectCollectionItem<Value>[],
  searchable: boolean,
  searchProps?: SelectSearchProps
) {
  const controlledQuery = searchProps?.value;
  const onQueryChange = searchProps?.onChange;
  const controlled = controlledQuery !== undefined;
  const external = controlled;
  const queryReadOnly = controlled && onQueryChange === undefined;
  const [internalQuery, setInternalQuery] = useState("");
  const query = controlled ? controlledQuery : internalQuery;

  useEffect(() => {
    if (
      queryReadOnly
      && process.env.NODE_ENV !== "production"
    ) {
      console.warn(
        "[Select] searchProps.value was provided without searchProps.onChange; "
          + "the search query is controlled and read-only."
      );
    }
  }, [queryReadOnly]);

  const setQuery = useCallback((nextQuery: string) => {
    if (!controlled) setInternalQuery(nextQuery);
    onQueryChange?.(nextQuery);
  }, [controlled, onQueryChange]);

  const resetQuery = useCallback(() => setQuery(""), [setQuery]);
  const visibleItems = useMemo(
    () => searchable && !external && query.trim().length > 0
      ? filterSelectItems(items, query, searchProps?.filter)
      : items,
    [external, items, query, searchProps?.filter, searchable]
  );

  return {
    controlled,
    external,
    query,
    queryReadOnly,
    resetQuery,
    setQuery,
    visibleItems
  };
}
