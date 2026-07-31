import type {
  SelectCollection,
  SelectNavigableRow
} from "./collection";

export function createTypeaheadMatcher(locale: string) {
  const collator = new Intl.Collator(locale, {
    sensitivity: "base",
    usage: "search"
  });

  const startsWith = (textValue: string, query: string) => {
    if (query.length === 0) return false;
    if (query.length > textValue.length) return false;
    return collator.compare(textValue.slice(0, query.length), query) === 0;
  };

  return function match(
    collection: SelectCollection<string>,
    query: string,
    afterNavigableIndex: number | null
  ): SelectNavigableRow<string> | null {
    const candidates = collection.navigableRows;
    const total = candidates.length;
    if (total === 0 || query.length === 0) return null;

    const start = afterNavigableIndex === null
      ? 0
      : (afterNavigableIndex + 1) % total;

    for (let step = 0; step < total; step += 1) {
      const row = candidates[(start + step) % total];
      if (!row) continue;
      const textValue = row.type === "option"
        ? row.option.textValue
        : row.action.textValue;
      if (startsWith(textValue, query)) return row;
    }
    return null;
  };
}
