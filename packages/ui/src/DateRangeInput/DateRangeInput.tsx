import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { DateInput } from "../DateInput/DateInput";
import type { DateRangeValue, DateValue } from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { classNames } from "../shared/classNames";
import styles from "./DateRangeInput.module.css";

export interface DateRangeInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  minDate?: DateValue | undefined;
  maxDate?: DateValue | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  fromName?: string | undefined;
  toName?: string | undefined;
  locale?: string | undefined;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  block?: boolean | undefined;
}

const EMPTY_RANGE: DateRangeValue = { from: null, to: null };

export const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(
  function DateRangeInput(
    {
      value: controlledValue,
      defaultValue = EMPTY_RANGE,
      onChange,
      minDate,
      maxDate,
      isDateUnavailable,
      fromName,
      toName,
      locale,
      label,
      hint,
      error,
      disabled,
      readOnly,
      required,
      block,
      className,
      ...nativeProps
    },
    ref
  ) {
    const [value, setValue] = useControllableValue(controlledValue, defaultValue, onChange);
    const rootRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const form = rootRef.current?.closest("form");
      if (!form) return;
      const reset = () => queueMicrotask(() => setValue(defaultValue));
      form.addEventListener("reset", reset);
      return () => form.removeEventListener("reset", reset);
    }, [defaultValue, setValue]);
    const assignRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };
    return (
      <div
        {...nativeProps}
        aria-invalid={error ? true : undefined}
        className={classNames(styles.root, block && styles.block, className)}
        ref={assignRef}
        role="group"
      >
        {label ? <div className={styles.label}>{label}{required ? " *" : null}</div> : null}
        <div className={styles.fields}>
          <DateInput
            aria-label={typeof label === "string" ? `${label}: ${locale?.startsWith("ru") ? "от" : "from"}` : undefined}
            block
            disabled={disabled}
            isDateUnavailable={isDateUnavailable}
            locale={locale}
            maxDate={maxDate}
            minDate={minDate}
            name={fromName}
            onChange={(from) => setValue({ ...value, from })}
            readOnly={readOnly}
            required={required}
            value={value.from}
          />
          <span aria-hidden="true" className={styles.separator}>—</span>
          <DateInput
            aria-label={typeof label === "string" ? `${label}: ${locale?.startsWith("ru") ? "до" : "to"}` : undefined}
            block
            disabled={disabled}
            isDateUnavailable={isDateUnavailable}
            locale={locale}
            maxDate={maxDate}
            minDate={minDate}
            name={toName}
            onChange={(to) => setValue({ ...value, to })}
            readOnly={readOnly}
            required={required}
            value={value.to}
          />
        </div>
        {error ? <div className={classNames(styles.message, styles.error)}>{error}</div> : hint ? <div className={styles.message}>{hint}</div> : null}
      </div>
    );
  }
);
