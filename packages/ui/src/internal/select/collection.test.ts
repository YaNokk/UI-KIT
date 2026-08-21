import { describe, expect, it } from "vitest";
import {
  normalizeSelectCollection,
  type SelectCollectionItem,
  type SelectValue
} from "./collection";

describe("Select collection value identity", () => {
  it("preserves numeric values in groups and maps", () => {
    const items: SelectCollectionItem<number>[] = [{
      type: "group",
      id: "numbers",
      label: "Numbers",
      items: [{ value: 0, label: "Zero", textValue: "Zero" }]
    }];

    const collection = normalizeSelectCollection(items);
    expect(collection.optionRowByValue.get(0)?.option.value).toBe(0);
    expect(typeof collection.optionRowByValue.get(0)?.option.value)
      .toBe("number");
  });

  it("keeps numeric 0 and string 0 distinct in maps and DOM row ids", () => {
    const items: SelectCollectionItem<SelectValue>[] = [
      { value: 0, label: "Number zero", textValue: "Number zero" },
      { value: "0", label: "String zero", textValue: "String zero" }
    ];

    const collection = normalizeSelectCollection(items);
    expect(collection.optionRowByValue.get(0)?.option.label).toBe("Number zero");
    expect(collection.optionRowByValue.get("0")?.option.label).toBe("String zero");
    expect(collection.rows.map((row) => row.rowId)).toEqual([
      "option:number:0",
      "option:string:0"
    ]);
  });
});
