import type { ReactNode } from "react";

export interface SelectOption<Value extends string = string> {
  type?: "option";
  value: Value;
  label: ReactNode;
  textValue: string;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
}

export interface SelectAction {
  type: "action";
  id: string;
  label: ReactNode;
  textValue: string;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}

export interface SelectGroup<Value extends string = string> {
  type: "group";
  id: string;
  label: ReactNode;
  items: SelectOption<Value>[];
}

export type SelectCollectionItem<Value extends string = string> =
  | SelectOption<Value>
  | SelectAction
  | SelectGroup<Value>;

export interface SelectOptionRow<Value extends string = string> {
  type: "option";
  rowId: string;
  rowIndex: number;
  navigableIndex: number;
  groupId?: string;
  option: SelectOption<Value>;
  disabled: boolean;
}

export interface SelectActionRow {
  type: "action";
  rowId: string;
  rowIndex: number;
  navigableIndex: number;
  action: SelectAction;
  disabled: boolean;
}

export interface SelectGroupHeaderRow {
  type: "group-header";
  rowId: string;
  rowIndex: number;
  navigableIndex: -1;
  groupId: string;
  label: ReactNode;
}

export type SelectRow<Value extends string = string> =
  | SelectOptionRow<Value>
  | SelectActionRow
  | SelectGroupHeaderRow;

export type SelectNavigableRow<Value extends string = string> =
  | SelectOptionRow<Value>
  | SelectActionRow;

export interface SelectCollection<Value extends string = string> {
  rows: SelectRow<Value>[];
  navigableRows: SelectNavigableRow<Value>[];
  optionRowByValue: Map<Value, SelectOptionRow<Value>>;
  optionCount: number;
}

function isSelectAction<Value extends string>(
  item: SelectCollectionItem<Value>
): item is SelectAction {
  return (item as SelectAction).type === "action";
}

function isSelectGroup<Value extends string>(
  item: SelectCollectionItem<Value>
): item is SelectGroup<Value> {
  return (item as SelectGroup<Value>).type === "group";
}

function warnDev(message: string) {
  if (process.env.NODE_ENV === "production") return;
  console.warn("[Select] " + message);
}

export function normalizeSelectCollection<Value extends string>(
  items: readonly SelectCollectionItem<Value>[]
): SelectCollection<Value> {
  const rows: SelectRow<Value>[] = [];
  const navigableRows: SelectNavigableRow<Value>[] = [];
  const optionRowByValue = new Map<Value, SelectOptionRow<Value>>();
  const seenOptionValues = new Set<Value>();
  const seenActionIds = new Set<string>();
  const seenGroupIds = new Set<string>();

  const pushNavigable = <Row extends SelectNavigableRow<Value>>(row: Row) => {
    rows.push(row);
    if (!row.disabled) navigableRows.push(row);
  };

  const pushOption = (
    option: SelectOption<Value>,
    groupId: string | undefined
  ) => {
    if (seenOptionValues.has(option.value)) {
      warnDev(
        'Duplicate option value "' + option.value + '"; the first occurrence '
          + "keeps selection identity."
      );
      return;
    }
    seenOptionValues.add(option.value);
    if (
      typeof option.textValue !== "string"
      || option.textValue.trim().length === 0
    ) {
      warnDev(
        'Option "' + option.value + '" must declare a non-empty textValue.'
      );
    }
    const row: SelectOptionRow<Value> = {
      type: "option",
      rowId: "option:" + option.value,
      rowIndex: rows.length,
      navigableIndex: navigableRows.length,
      ...(groupId !== undefined ? { groupId } : {}),
      option: { ...option, type: "option" },
      disabled: option.disabled === true
    };
    optionRowByValue.set(option.value, row);
    pushNavigable(row);
  };

  const pushAction = (action: SelectAction) => {
    if (seenActionIds.has(action.id)) {
      warnDev(
        'Duplicate action id "' + action.id + '"; the first occurrence is kept.'
      );
      return;
    }
    seenActionIds.add(action.id);
    if (
      typeof action.textValue !== "string"
      || action.textValue.trim().length === 0
    ) {
      warnDev(
        'Action "' + action.id + '" must declare a non-empty textValue.'
      );
    }
    const row: SelectActionRow = {
      type: "action",
      rowId: "action:" + action.id,
      rowIndex: rows.length,
      navigableIndex: navigableRows.length,
      action,
      disabled: action.disabled === true
    };
    pushNavigable(row);
  };

  for (const item of items) {
    if (isSelectAction(item)) {
      pushAction(item);
      continue;
    }
    if (isSelectGroup(item)) {
      if (seenGroupIds.has(item.id)) {
        warnDev(
          'Duplicate group id "' + item.id + '"; the first occurrence is kept.'
        );
        continue;
      }
      seenGroupIds.add(item.id);
      rows.push({
        type: "group-header",
        rowId: "group:" + item.id,
        rowIndex: rows.length,
        navigableIndex: -1,
        groupId: item.id,
        label: item.label
      });
      for (const child of item.items) {
        if (isSelectAction(child) || isSelectGroup(child)) {
          warnDev(
            'Group "' + item.id + '" only supports option children in v1; '
              + "nested content was ignored."
          );
          continue;
        }
        pushOption(child, item.id);
      }
      continue;
    }
    pushOption(item, undefined);
  }

  return {
    rows,
    navigableRows,
    optionRowByValue,
    optionCount: optionRowByValue.size
  };
}
