import {
  type ChangeEvent,
  type ReactNode,
  useId
} from "react";
import {
  ChoiceGroupField,
  useControllableChoiceState
} from "../internal/choice-control/index.js";
import { RadioControl } from "../Radio/Radio.js";
import type {
  ChoiceControlSize,
  ChoiceGroupOrientation
} from "../shared/choiceControl.js";

export interface RadioGroupOption<Value extends string> {
  description?: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  value: Value;
}

export interface RadioGroupProps<Value extends string = string> {
  block?: boolean;
  className?: string;
  defaultValue?: Value | null;
  description?: ReactNode;
  disabled?: boolean;
  error?: ReactNode;
  label: ReactNode;
  name?: string;
  onChange?: (
    value: Value,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  options: readonly RadioGroupOption<Value>[];
  orientation?: ChoiceGroupOrientation;
  required?: boolean;
  size?: ChoiceControlSize;
  value?: Value | null;
}

export function RadioGroup<Value extends string = string>({
  block = false,
  className,
  defaultValue = null,
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
}: RadioGroupProps<Value>) {
  const generatedId = useId();
  const groupName = name ?? `radio-group-${generatedId}`;
  const [selectedValue, setSelectedValue] = useControllableChoiceState<Value | null>(
    value,
    defaultValue
  );

  return (
    <ChoiceGroupField
      block={block}
      className={className}
      description={description}
      disabled={disabled}
      error={error}
      groupId={generatedId}
      label={label}
      orientation={orientation}
      required={required}
    >
      {options.map((option) => {
        const optionDisabled = disabled || option.disabled === true;
        return (
          <RadioControl
            checked={selectedValue === option.value}
            description={option.description}
            disabled={optionDisabled}
            key={option.value}
            label={option.label}
            name={groupName}
            onChange={(checked, event) => {
              if (!checked) return;
              setSelectedValue(option.value);
              onChange?.(option.value, event);
            }}
            required={required && !optionDisabled}
            size={size}
            value={option.value}
          />
        );
      })}
    </ChoiceGroupField>
  );
}
