import { describe, expectTypeOf, it } from "vitest";
import type { MultiSelectProps } from "../MultiSelect/MultiSelect";
import type { SelectCollectionItem, SelectOption } from "../internal/select/collection";
import type { SelectProps } from "./Select";

const numericItems: SelectCollectionItem<number>[] = [
  {
    type: "group",
    id: "numbers",
    label: "Numbers",
    items: [{ value: 0, label: "Zero", textValue: "Zero" }]
  }
];

describe("Select public value types", () => {
  it("preserves scalar types through items, selected items and callbacks", () => {
    const selectedItem: SelectOption<number> = {
      value: 0,
      label: "Zero",
      textValue: "Zero"
    };
    const selectProps: SelectProps<number> = {
      items: numericItems,
      onChange: (value) => {
        expectTypeOf(value).toEqualTypeOf<number | null>();
      },
      selectedItem,
      value: 0
    };
    const multiSelectProps: MultiSelectProps<number> = {
      items: numericItems,
      onChange: (value) => {
        expectTypeOf(value).toEqualTypeOf<number[]>();
      },
      selectedItems: [selectedItem],
      value: [0]
    };

    expectTypeOf(selectProps.value).toEqualTypeOf<number | null>();
    expectTypeOf(multiSelectProps.value).toEqualTypeOf<number[]>();
  });

  it("rejects mismatched value, item and callback types", () => {
    const correct: SelectProps<number> = {
      items: numericItems,
      onChange: () => undefined,
      value: 0
    };

    const wrongValue: SelectProps<number> = {
      ...correct,
      // @ts-expect-error number Select does not accept a string value
      value: "0"
    };
    const wrongItems: SelectProps<number> = {
      ...correct,
      // @ts-expect-error number Select does not accept string-valued items
      items: [{ value: "0", label: "Zero", textValue: "Zero" }]
    };
    const wrongCallback: SelectProps<number> = {
      ...correct,
      // @ts-expect-error callback must receive the declared number scalar
      onChange: (value: string | null) => {
        expectTypeOf(value).toEqualTypeOf<string | null>();
      }
    };
    const wrongMultiValue: MultiSelectProps<number> = {
      items: numericItems,
      onChange: () => undefined,
      // @ts-expect-error number MultiSelect does not accept string values
      value: ["0"]
    };

    expectTypeOf(wrongValue).toEqualTypeOf<SelectProps<number>>();
    expectTypeOf(wrongItems).toEqualTypeOf<SelectProps<number>>();
    expectTypeOf(wrongCallback).toEqualTypeOf<SelectProps<number>>();
    expectTypeOf(wrongMultiValue).toEqualTypeOf<MultiSelectProps<number>>();
  });
});
