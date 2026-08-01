import {
  forwardRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef
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

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "checked" | "defaultChecked" | "onChange" | "size" | "type"
  > {
  align?: ChoiceControlAlign;
  block?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  indeterminate?: boolean;
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

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
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
    indeterminate = false,
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const invalid = error != null
    || (ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== "false");
  const message = error ?? description;
  const messageId = message == null
    ? undefined
    : `${inputId}-${error != null ? "error" : "description"}`;
  const labelId = label == null ? undefined : `${inputId}-label`;

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const setInputRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.indeterminate = indeterminate;
    onChange?.(event.currentTarget.checked, event);
  };

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
        onChange={handleChange}
        ref={setInputRef}
        type="checkbox"
      />
      <ChoiceIndicator
        checked={checked === true}
        disabled={disabled}
        indeterminate={indeterminate}
        invalid={invalid}
        kind="checkbox"
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
