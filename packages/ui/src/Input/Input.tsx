import {
  forwardRef,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
  useRef,
  useState
} from "react";
import { FieldShell } from "../FieldShell/FieldShell";
import { FormControl } from "../FormControl/FormControl";
import type { FieldLabelView, FieldSize } from "../shared/field";
import styles from "./Input.module.css";

export type InputSize = FieldSize;

export interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "children" | "color" | "size" | "style"
  > {
  endAdornment?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  label?: ReactNode;
  labelView?: FieldLabelView;
  size?: InputSize;
  startAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
    defaultValue,
    disabled = false,
    endAdornment,
    error,
    hint,
    id,
    label,
    labelView = "outer",
    onBlur,
    onChange,
    onFocus,
    readOnly = false,
    required = false,
    size = "md",
    startAdornment,
    type = "text",
    value,
    ...nativeProps
  },
  ref
) {
  const invalid = error != null || ariaInvalid === true || ariaInvalid === "true";
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [uncontrolledHasContent, setUncontrolledHasContent] = useState(
    defaultValue != null && String(defaultValue).length > 0
  );
  const hasContent = value !== undefined
    ? String(value).length > 0
    : uncontrolledHasContent;
  const effectiveLabelView = labelView === "inner" && label != null
    ? "inner"
    : "outer";
  const labelFloated = focused || hasContent;

  const setInputRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUncontrolledHasContent(event.currentTarget.value.length > 0);
    onChange?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <FormControl
      className={className}
      controlId={id}
      describedBy={ariaDescribedBy}
      disabled={disabled}
      error={error}
      hint={hint}
      invalid={invalid}
      label={label}
      labelView={effectiveLabelView}
      required={required}
    >
      {(controlProps) => (
        <FieldShell
          disabled={disabled}
          endAdornment={endAdornment}
          invalid={invalid}
          label={controlProps.label}
          labelFloated={labelFloated}
          labelView={effectiveLabelView}
          onFocusRequest={() => inputRef.current?.focus()}
          readOnly={readOnly}
          size={size}
          startAdornment={startAdornment}
        >
          <input
            {...nativeProps}
            {...controlProps}
            className={styles.input}
            data-field-part="native-control"
            data-label-floated={labelFloated ? "" : undefined}
            data-label-view={effectiveLabelView}
            defaultValue={defaultValue}
            disabled={disabled}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            readOnly={readOnly}
            ref={setInputRef}
            type={type}
            value={value}
          />
        </FieldShell>
      )}
    </FormControl>
  );
});
