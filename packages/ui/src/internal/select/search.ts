import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  SelectCollectionItem,
  SelectGroup,
  SelectOption
} from "./collection";
import type { SelectSearchProps } from "./types";

function isGroup<Value extends string>(
  item: SelectCollectionItem<Value>
): item is SelectGroup<Value> {
  return item.type === "group";
}

function isAction<Value extends string>(item: SelectCollectionItem<Value>) {
  return item.type === "action";
}

export function filterSelectItems<Value extends string>(
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

export function useSelectSearch<Value extends string>(
  items: readonly SelectCollectionItem<Value>[],
  searchable: boolean,
  searchProps?: SelectSearchProps
) {
  const controlledQuery = searchProps?.value;
  const external = controlledQuery !== undefined && searchProps?.onChange !== undefined;
  const [query, setQueryState] = useState(controlledQuery ?? "");

  useEffect(() => {
    if (controlledQuery !== undefined) setQueryState(controlledQuery);
  }, [controlledQuery]);

  const setQuery = useCallback((nextQuery: string) => {
    setQueryState(nextQuery);
    searchProps?.onChange?.(nextQuery);
  }, [searchProps]);

  const resetQuery = useCallback(() => setQuery(""), [setQuery]);
  const visibleItems = useMemo(
    () => searchable && !external
      ? filterSelectItems(items, query, searchProps?.filter)
      : [...items],
    [external, items, query, searchProps?.filter, searchable]
  );

  return { external, query, resetQuery, setQuery, visibleItems };
}
