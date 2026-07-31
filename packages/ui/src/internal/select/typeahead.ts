import type {
  SelectCollection,
  SelectOptionRow
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
    afterRowId: string | null
  ): SelectOptionRow<string> | null {
    const candidates = collection.optionNavigationRows;
    const total = candidates.length;
    if (total === 0 || query.length === 0) return null;

    const currentIndex = afterRowId === null
      ? -1
      : candidates.findIndex((row) => row.rowId === afterRowId);
    const start = currentIndex < 0
      ? 0
      : (currentIndex + 1) % total;

    for (let step = 0; step < total; step += 1) {
      const row = candidates[(start + step) % total];
      if (!row) continue;
      const textValue = row.option.textValue;
      if (startsWith(textValue, query)) return row;
    }
    return null;
  };
}
