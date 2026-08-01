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

export interface RadioProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "checked" | "defaultChecked" | "onChange" | "size" | "type"
  > {
  align?: ChoiceControlAlign;
  block?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  description?: ReactNode;
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

export const RadioControl = forwardRef<HTMLInputElement, RadioProps>(
  function RadioControl(
    {
      "aria-describedby": ariaDescribedBy,
      "aria-labelledby": ariaLabelledBy,
      align = "start",
      block = false,
      checked,
      className,
      defaultChecked,
      description,
      disabled = false,
      id,
      label,
      onChange,
      position = "start",
      size = "md",
      ...nativeProps
    },
    ref
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = description == null ? undefined : `${inputId}-description`;
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
          aria-describedby={joinIds(ariaDescribedBy, descriptionId)}
          aria-labelledby={joinIds(ariaLabelledBy, labelId)}
          checked={checked}
          className={choiceControlStyles.nativeInput}
          defaultChecked={defaultChecked}
          disabled={disabled}
          id={inputId}
          onChange={(event) => onChange?.(event.currentTarget.checked, event)}
          ref={ref}
          type="radio"
        />
        <ChoiceIndicator
          checked={checked === true}
          disabled={disabled}
          kind="radio"
          size={size}
        />
        <ChoiceControlContent
          description={description}
          disabled={disabled}
          label={label}
          labelId={labelId}
          messageId={descriptionId}
          size={size}
        />
      </ChoiceControlLayout>
    );
  }
);

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  return <RadioControl {...props} ref={ref} />;
});
