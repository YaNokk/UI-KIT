import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { DateTimeInput } from "../DateTimeInput/DateTimeInput";
import type { MinuteStep } from "../TimeInput/TimeInput";
import { resolveDateMessages } from "../internal/date/resolveDateMessages";
import { parseLocalizedDateTime } from "../internal/date/dateFormatting";
import { isDateAllowed, isTimeAllowed } from "../internal/date/dateValidation";
import type { DateTimeRangeValue, DateValue, LocalDateTimeValue, TimeValue } from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import { classNames } from "../shared/classNames";
import styles from "./DateTimeRangeInput.module.css";

const EMPTY_RANGE: DateTimeRangeValue = { from: null, to: null };

export interface DateTimeRangeInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: DateTimeRangeValue;
  defaultValue?: DateTimeRangeValue;
  onChange?: (value: DateTimeRangeValue) => void;
  minuteStep?: MinuteStep;
  minValue?: LocalDateTimeValue | undefined;
  maxValue?: LocalDateTimeValue | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  isTimeUnavailable?: ((value: LocalDateTimeValue, boundary: "from" | "to") => boolean) | undefined;
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

export const DateTimeRangeInput = forwardRef<HTMLDivElement, DateTimeRangeInputProps>(
  function DateTimeRangeInput(
    {
      value: controlledValue,
      defaultValue = EMPTY_RANGE,
      onChange,
      minuteStep = 1,
      minValue,
      maxValue,
      isDateUnavailable,
      isTimeUnavailable,
      fromName,
      toName,
      locale: explicitLocale,
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
    const locale = useResolvedLocale(explicitLocale);
    const messages = resolveDateMessages(locale);
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
    const rangeError = value.from && value.to && value.from > value.to ? messages.invalidRange : null;
    const visibleError = error !== undefined ? error : rangeError;
    const keepOnlyValidBoundary = (text: string, boundary: "from" | "to") => {
      const candidate = parseLocalizedDateTime(text, locale);
      const valid = candidate
        && isDateAllowed(candidate.slice(0, 10) as DateValue, { isDateUnavailable })
        && isTimeAllowed(candidate.slice(11, 16) as TimeValue, { minuteStep })
        && (!minValue || candidate >= minValue)
        && (!maxValue || candidate <= maxValue)
        && !isTimeUnavailable?.(candidate, boundary);
      if (!valid && value[boundary] !== null) setValue({ ...value, [boundary]: null });
    };
    return (
      <div {...nativeProps} className={classNames(styles.root, block && styles.block, className)} ref={assignRef} role="group">
        {label ? <div className={styles.label}>{label}{required ? " *" : null}</div> : null}
        <div className={styles.boundaries}>
          <DateTimeInput
            block
            disabled={disabled}
            isDateUnavailable={isDateUnavailable}
            isTimeUnavailable={(candidate) => Boolean(isTimeUnavailable?.(candidate, "from"))}
            label={messages.startDateTime}
            labelView="inner"
            locale={locale}
            maxValue={maxValue}
            minValue={minValue}
            minuteStep={minuteStep}
            name={fromName}
            onChange={(from) => setValue({ ...value, from })}
            onInputValueChange={(text) => keepOnlyValidBoundary(text, "from")}
            readOnly={readOnly}
            required={required}
            value={value.from}
          />
          <span aria-hidden="true" className={styles.separator}>—</span>
          <DateTimeInput
            block
            disabled={disabled}
            isDateUnavailable={isDateUnavailable}
            isTimeUnavailable={(candidate) => Boolean(isTimeUnavailable?.(candidate, "to"))}
            label={messages.endDateTime}
            labelView="inner"
            locale={locale}
            maxValue={maxValue}
            minValue={minValue}
            minuteStep={minuteStep}
            name={toName}
            onChange={(to) => setValue({ ...value, to })}
            onInputValueChange={(text) => keepOnlyValidBoundary(text, "to")}
            readOnly={readOnly}
            required={required}
            value={value.to}
          />
        </div>
        {visibleError != null ? <div className={classNames(styles.message, styles.error)}>{visibleError}</div> : hint ? <div className={styles.message}>{hint}</div> : null}
      </div>
    );
  }
);
