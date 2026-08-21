import type { ReactNode } from "react";

export type SelectValue = string | number;

export function getSelectValueIdentity(value: SelectValue): string {
  return typeof value + ":" + String(value);
}

export interface SelectOption<Value extends SelectValue = string> {
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

export interface SelectGroup<Value extends SelectValue = string> {
  type: "group";
  id: string;
  label: ReactNode;
  items: SelectOption<Value>[];
}

export type SelectCollectionItem<Value extends SelectValue = string> =
  | SelectOption<Value>
  | SelectAction
  | SelectGroup<Value>;

export interface SelectOptionRow<Value extends SelectValue = string> {
  type: "option";
  rowId: string;
  rowIndex: number;
  groupId?: string;
  option: SelectOption<Value>;
  disabled: boolean;
}

export interface SelectActionRow {
  type: "action";
  rowId: string;
  rowIndex: number;
  action: SelectAction;
  disabled: boolean;
}

export interface SelectGroupHeaderRow {
  type: "group-header";
  rowId: string;
  rowIndex: number;
  groupId: string;
  label: ReactNode;
}

export type SelectRow<Value extends SelectValue = string> =
  | SelectOptionRow<Value>
  | SelectActionRow
  | SelectGroupHeaderRow;

export type SelectInteractiveRow<Value extends SelectValue = string> =
  | SelectOptionRow<Value>
  | SelectActionRow;

export interface SelectCollection<Value extends SelectValue = string> {
  rows: SelectRow<Value>[];
  optionNavigationRows: SelectOptionRow<Value>[];
  actionFocusItems: SelectActionRow[];
  optionRowByValue: Map<Value, SelectOptionRow<Value>>;
  optionCount: number;
}

function isSelectAction<Value extends SelectValue>(
  item: SelectCollectionItem<Value>
): item is SelectAction {
  return (item as SelectAction).type === "action";
}

function isSelectGroup<Value extends SelectValue>(
  item: SelectCollectionItem<Value>
): item is SelectGroup<Value> {
  return (item as SelectGroup<Value>).type === "group";
}

function warnDev(message: string) {
  if (process.env.NODE_ENV === "production") return;
  console.warn("[Select] " + message);
}

export function normalizeSelectCollection<Value extends SelectValue>(
  items: readonly SelectCollectionItem<Value>[]
): SelectCollection<Value> {
  const rows: SelectRow<Value>[] = [];
  const optionNavigationRows: SelectOptionRow<Value>[] = [];
  const actionFocusItems: SelectActionRow[] = [];
  const optionRowByValue = new Map<Value, SelectOptionRow<Value>>();
  const seenOptionValues = new Set<Value>();
  const seenActionIds = new Set<string>();
  const seenGroupIds = new Set<string>();

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
      rowId: "option:" + getSelectValueIdentity(option.value),
      rowIndex: rows.length,
      ...(groupId !== undefined ? { groupId } : {}),
      option: { ...option, type: "option" },
      disabled: option.disabled === true
    };
    optionRowByValue.set(option.value, row);
    rows.push(row);
    if (!row.disabled) optionNavigationRows.push(row);
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
      action,
      disabled: action.disabled === true
    };
    rows.push(row);
    if (!row.disabled) actionFocusItems.push(row);
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
    optionNavigationRows,
    actionFocusItems,
    optionRowByValue,
    optionCount: optionRowByValue.size
  };
}
