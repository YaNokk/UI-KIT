import {
  forwardRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  useId
} from "react";
import {
  ChoiceControlContent,
  ChoiceControlLayout,
  ChoiceIndicator,
  choiceControlStyles
} from "../internal/choice-control/index.js";
import type {
  ChoiceControlAlign,
  ChoiceControlPosition,
  ChoiceControlSize
} from "../shared/choiceControl.js";

export interface SwitchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "checked" | "defaultChecked" | "onChange" | "role" | "size" | "type"
  > {
  align?: ChoiceControlAlign;
  block?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  label?: ReactNode;
  onChange?: (
    checked: boolean,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  position?: ChoiceControlPosition;
  size?: ChoiceControlSize;
}

function joinIds(...ids: Array<string | undefined>): string | undefined {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-labelledby": ariaLabelledBy,
    align = "start",
    block = false,
    checked,
    className,
    defaultChecked,
    description,
    disabled = false,
    error,
    id,
    label,
    onChange,
    position = "end",
    size = "md",
    ...nativeProps
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const invalid = error != null
    || (ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== "false");
  const message = error ?? description;
  const messageId = message == null
    ? undefined
    : `${inputId}-${error != null ? "error" : "description"}`;
  const labelId = label == null ? undefined : `${inputId}-label`;

  return (
    <ChoiceControlLayout
      align={align}
      block={block}
      className={className}
      disabled={disabled}
      position={position}
    >
      <input
        {...nativeProps}
        aria-describedby={joinIds(ariaDescribedBy, messageId)}
        aria-invalid={error != null ? true : ariaInvalid}
        aria-labelledby={joinIds(ariaLabelledBy, labelId)}
        checked={checked}
        className={choiceControlStyles.nativeInput}
        defaultChecked={defaultChecked}
        disabled={disabled}
        id={inputId}
        onChange={(event) => onChange?.(event.currentTarget.checked, event)}
        ref={ref}
        role="switch"
        type="checkbox"
      />
      <ChoiceIndicator
        checked={checked === true}
        disabled={disabled}
        invalid={invalid}
        kind="switch"
        size={size}
      />
      <ChoiceControlContent
        description={description}
        disabled={disabled}
        error={error}
        label={label}
        labelId={labelId}
        messageId={messageId}
        size={size}
      />
    </ChoiceControlLayout>
  );
});
