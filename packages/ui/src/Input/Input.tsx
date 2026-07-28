import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode
} from "react";
import { FieldShell } from "../FieldShell/FieldShell";
import { FormControl } from "../FormControl/FormControl";
import type { FieldSize } from "../shared/field";
import styles from "./Input.module.css";

export type InputSize = FieldSize;

export interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "children" | "color" | "size" | "style"
  > {
  description?: ReactNode;
  endAdornment?: ReactNode;
  error?: ReactNode;
  label?: ReactNode;
  size?: InputSize;
  startAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
    description,
    disabled = false,
    endAdornment,
    error,
    id,
    label,
    readOnly = false,
    required = false,
    size = "md",
    startAdornment,
    type = "text",
    ...nativeProps
  },
  ref
) {
  const invalid = error != null || ariaInvalid === true || ariaInvalid === "true";

  return (
    <FormControl
      className={className}
      controlId={id}
      describedBy={ariaDescribedBy}
      description={description}
      disabled={disabled}
      error={error}
      invalid={invalid}
      label={label}
      required={required}
    >
      {(controlProps) => (
        <FieldShell
          disabled={disabled}
          endAdornment={endAdornment}
          invalid={invalid}
          readOnly={readOnly}
          size={size}
          startAdornment={startAdornment}
        >
          <input
            {...nativeProps}
            {...controlProps}
            className={styles.input}
            disabled={disabled}
            readOnly={readOnly}
            ref={ref}
            type={type}
          />
        </FieldShell>
      )}
    </FormControl>
  );
});
