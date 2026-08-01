import {
  type ChangeEvent,
  type ReactNode,
  useId
} from "react";
import { Checkbox } from "../Checkbox/Checkbox.js";
import {
  ChoiceGroupField,
  useControllableChoiceState
} from "../internal/choice-control/index.js";
import type {
  ChoiceControlSize,
  ChoiceGroupOrientation
} from "../shared/choiceControl.js";

export interface CheckboxGroupOption<Value extends string> {
  description?: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  value: Value;
}

export interface CheckboxGroupProps<Value extends string = string> {
  block?: boolean;
  className?: string;
  defaultValue?: readonly Value[];
  description?: ReactNode;
  disabled?: boolean;
  error?: ReactNode;
  label: ReactNode;
  name?: string;
  onChange?: (
    value: Value[],
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  options: readonly CheckboxGroupOption<Value>[];
  orientation?: ChoiceGroupOrientation;
  required?: boolean;
  size?: ChoiceControlSize;
  value?: readonly Value[];
}

export function CheckboxGroup<Value extends string = string>({
  block = false,
  className,
  defaultValue = [],
  description,
  disabled = false,
  error,
  label,
  name,
  onChange,
  options,
  orientation = "vertical",
  required = false,
  size = "md",
  value
}: CheckboxGroupProps<Value>) {
  const groupId = useId();
  const [selectedValues, setSelectedValues] = useControllableChoiceState<readonly Value[]>(
    value,
    defaultValue
  );
  const selectedSet = new Set(selectedValues);

  const handleChange = (
    optionValue: Value,
    checked: boolean,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const nextSet = new Set(selectedValues);
    if (checked) nextSet.add(optionValue);
    else nextSet.delete(optionValue);

    const nextValue = options
      .map((option) => option.value)
      .filter((candidate) => nextSet.has(candidate));
    setSelectedValues(nextValue);
    onChange?.(nextValue, event);
  };

  return (
    <ChoiceGroupField
      block={block}
      className={className}
      description={description}
      disabled={disabled}
      error={error}
      groupId={groupId}
      label={label}
      orientation={orientation}
      required={required}
    >
      {options.map((option) => (
        <Checkbox
          checked={selectedSet.has(option.value)}
          description={option.description}
          disabled={disabled || option.disabled}
          key={option.value}
          label={option.label}
          name={name}
          onChange={(checked, event) => handleChange(option.value, checked, event)}
          size={size}
          value={option.value}
        />
      ))}
    </ChoiceGroupField>
  );
}
