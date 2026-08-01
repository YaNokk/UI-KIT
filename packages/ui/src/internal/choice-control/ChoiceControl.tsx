import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import type {
  ChoiceControlAlign,
  ChoiceControlPosition,
  ChoiceControlSize,
  ChoiceGroupOrientation
} from "../../shared/choiceControl";
import { classNames } from "../../shared/classNames";
import styles from "./ChoiceControl.module.css";

export type ChoiceIndicatorKind = "checkbox" | "radio" | "switch";

export interface ChoiceIndicatorProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
  kind: ChoiceIndicatorKind;
  size: ChoiceControlSize;
}

export function ChoiceIndicator({
  checked = false,
  className,
  disabled = false,
  indeterminate = false,
  invalid = false,
  kind,
  size
}: ChoiceIndicatorProps) {
  const selected = checked || (kind === "checkbox" && indeterminate);

  return (
    <span
      aria-hidden="true"
      className={classNames(styles.indicator, styles[size], className)}
      data-checked={selected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-indeterminate={indeterminate ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-kind={kind}
    >
      {kind === "checkbox" ? <Check className={styles.checkmark} /> : null}
      {kind === "checkbox" ? <Minus className={styles.indeterminateMark} /> : null}
      {kind === "radio" ? <span className={styles.radioDot} /> : null}
      {kind === "switch" ? <span className={styles.switchThumb} /> : null}
    </span>
  );
}

interface ChoiceControlContentProps {
  description?: ReactNode;
  disabled?: boolean;
  error?: ReactNode;
  label?: ReactNode;
  labelId?: string | undefined;
  messageId?: string | undefined;
  size: ChoiceControlSize;
}

export function ChoiceControlContent({
  description,
  disabled = false,
  error,
  label,
  labelId,
  messageId,
  size
}: ChoiceControlContentProps) {
  const message = error ?? description;
  if (label == null && message == null) return null;

  return (
    <span
      className={styles.content}
      data-disabled={disabled ? "" : undefined}
      data-size={size}
    >
      {label == null ? null : <span className={styles.labelText} id={labelId}>{label}</span>}
      {message == null ? null : (
        <span
          className={classNames(styles.message, error != null && styles.error)}
          id={messageId}
        >
          {message}
        </span>
      )}
    </span>
  );
}

interface ChoiceControlLayoutProps {
  align: ChoiceControlAlign;
  block: boolean;
  children: ReactNode;
  className?: string | undefined;
  disabled: boolean;
  position: ChoiceControlPosition;
}

export function ChoiceControlLayout({
  align,
  block,
  children,
  className,
  disabled,
  position
}: ChoiceControlLayoutProps) {
  return (
    <label
      className={classNames(styles.root, block && styles.block, className)}
      data-align={align}
      data-disabled={disabled ? "" : undefined}
      data-position={position}
    >
      {children}
    </label>
  );
}

interface ChoiceGroupFieldProps {
  "aria-label"?: string;
  block: boolean;
  children: ReactNode;
  className?: string | undefined;
  description?: ReactNode;
  disabled: boolean;
  error?: ReactNode;
  groupId: string;
  label: ReactNode;
  orientation: ChoiceGroupOrientation;
  required: boolean;
}

export function ChoiceGroupField({
  "aria-label": ariaLabel,
  block,
  children,
  className,
  description,
  disabled,
  error,
  groupId,
  label,
  orientation,
  required
}: ChoiceGroupFieldProps) {
  const message = error ?? description;
  const messageId = message == null ? undefined : `${groupId}-${error != null ? "error" : "description"}`;

  return (
    <fieldset
      aria-describedby={messageId}
      aria-invalid={error != null ? true : undefined}
      aria-label={ariaLabel}
      className={classNames(styles.group, block && styles.block, className)}
      data-invalid={error != null ? "" : undefined}
      data-required={required ? "" : undefined}
      disabled={disabled}
    >
      <legend className={styles.legend}>
        {label}
        {required ? <span aria-hidden="true" className={styles.required}>*</span> : null}
      </legend>
      {message == null ? null : (
        <div
          className={classNames(styles.groupMessage, error != null && styles.error)}
          id={messageId}
        >
          {message}
        </div>
      )}
      <div className={styles.options} data-orientation={orientation}>
        {children}
      </div>
    </fieldset>
  );
}
