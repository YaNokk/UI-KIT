import {
  forwardRef,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
  useRef,
  useState
} from "react";
import { FieldShell } from "../FieldShell/FieldShell";
import { FormControl } from "../FormControl/FormControl";
import { classNames } from "../shared/classNames";
import type { FieldLabelView, FieldSize } from "../shared/field";
import styles from "./Textarea.module.css";
import { useTextareaAutosize } from "./useTextareaAutosize";

export type TextareaSize = FieldSize;
export type TextareaResize = "none" | "vertical";

export interface TextareaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "children" | "color" | "style"
  > {
  autoSize?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
  label?: ReactNode;
  labelView?: FieldLabelView;
  maxRows?: number;
  minRows?: number;
  resize?: TextareaResize;
  showCount?: boolean;
  size?: TextareaSize;
}

const defaultRows: Record<FieldSize, number> = {
  sm: 3,
  md: 4,
  lg: 5
};

const sizeClassNames: Record<FieldSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg
};

function normalizeRows(value: number | undefined, fallback: number) {
  if (value == null || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

function getTextLength(value: unknown) {
  if (value == null) return 0;
  return String(value).length;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      autoSize = false,
      className,
      defaultValue,
      disabled = false,
      error,
      hint,
      id,
      label,
      labelView = "outer",
      maxLength,
      maxRows,
      minRows,
      onBlur,
      onChange,
      onFocus,
      readOnly = false,
      required = false,
      resize = "vertical",
      rows,
      showCount = false,
      size = "md",
      value,
      ...nativeProps
    },
    ref
  ) {
    const invalid = error != null || ariaInvalid === true || ariaInvalid === "true";
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [focused, setFocused] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
    const currentValue = value === undefined ? uncontrolledValue : value;
    const hasContent = getTextLength(currentValue) > 0;
    const effectiveLabelView = labelView === "inner" && label != null
      ? "inner"
      : "outer";
    const labelFloated = focused || hasContent;
    const resolvedMinRows = normalizeRows(minRows, defaultRows[size]);
    const resolvedMaxRows = maxRows == null
      ? undefined
      : Math.max(resolvedMinRows, normalizeRows(maxRows, resolvedMinRows));
    const measure = useTextareaAutosize(textareaRef, {
      enabled: autoSize,
      maxRows: resolvedMaxRows,
      minRows: resolvedMinRows,
      value: currentValue
    });

    const setTextareaRef = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      setUncontrolledValue(event.currentTarget.value);
      onChange?.(event);
      if (autoSize) queueMicrotask(measure);
    };

    const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false);
      onBlur?.(event);
    };

    const count = getTextLength(currentValue);
    const counter = showCount ? (
      <span className={styles.counter} data-textarea-count="">
        {maxLength == null ? count : `${count} / ${maxLength}`}
      </span>
    ) : null;
    const supportingContent = (content: ReactNode) => (
      <div className={styles.supportingRow}>
        {content == null ? <span /> : <div>{content}</div>}
        {counter}
      </div>
    );
    const resolvedHint = error == null && (hint != null || counter != null)
      ? supportingContent(hint)
      : hint;
    const resolvedError = error == null ? undefined : supportingContent(error);

    return (
      <FormControl
        className={className}
        controlId={id}
        data-field-textlike=""
        describedBy={ariaDescribedBy}
        disabled={disabled}
        error={resolvedError}
        hint={resolvedHint}
        invalid={invalid}
        label={label}
        labelView={effectiveLabelView}
        required={required}
      >
        {({ label: controlLabel, ...controlProps }) => (
          <FieldShell
            className={classNames(
              styles.shell,
              sizeClassNames[size],
              effectiveLabelView === "inner" && styles.inner
            )}
            data-autosize={autoSize ? "" : undefined}
            data-field-textlike=""
            data-multiline=""
            disabled={disabled}
            invalid={invalid}
            label={controlLabel}
            labelFloated={labelFloated}
            labelView={effectiveLabelView}
            onFocusRequest={() => textareaRef.current?.focus()}
            readOnly={readOnly}
            size={size}
          >
            <textarea
              {...nativeProps}
              {...controlProps}
              className={classNames(
                styles.textarea,
                autoSize ? styles.resizeNone : styles[`resize-${resize}`]
              )}
              data-field-part="native-control"
              data-label-floated={labelFloated ? "" : undefined}
              data-label-view={effectiveLabelView}
              defaultValue={defaultValue}
              disabled={disabled}
              maxLength={maxLength}
              onBlur={handleBlur}
              onChange={handleChange}
              onFocus={handleFocus}
              readOnly={readOnly}
              ref={setTextareaRef}
              rows={autoSize ? resolvedMinRows : (rows ?? defaultRows[size])}
              value={value}
            />
          </FieldShell>
        )}
      </FormControl>
    );
  }
);
