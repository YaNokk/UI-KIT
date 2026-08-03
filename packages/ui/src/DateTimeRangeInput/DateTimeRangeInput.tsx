import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { DateInput } from "../DateInput/DateInput";
import { TimeInput, type MinuteStep } from "../TimeInput/TimeInput";
import { joinLocalDateTime } from "../internal/date/parseLocalDateTimeValue";
import type {
  DateTimeRangeValue,
  DateValue,
  LocalDateTimeValue,
  TimeValue
} from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { classNames } from "../shared/classNames";
import styles from "./DateTimeRangeInput.module.css";

const EMPTY_RANGE: DateTimeRangeValue = { from: null, to: null };

function split(value: LocalDateTimeValue | null): [DateValue | null, TimeValue | null] {
  return value
    ? [value.slice(0, 10) as DateValue, value.slice(11, 16) as TimeValue]
    : [null, null];
}

export interface DateTimeRangeInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: DateTimeRangeValue;
  defaultValue?: DateTimeRangeValue;
  onChange?: (value: DateTimeRangeValue) => void;
  minuteStep?: MinuteStep;
  defaultStartTime?: TimeValue;
  defaultEndTime?: TimeValue;
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
      defaultStartTime = "00:00",
      defaultEndTime = "23:59",
      minValue,
      maxValue,
      isDateUnavailable,
      isTimeUnavailable,
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
    const [fromDate, fromTime] = split(value.from);
    const [toDate, toTime] = split(value.to);
    const update = (
      boundary: "from" | "to",
      date: DateValue | null,
      time: TimeValue | null
    ) => {
      const next = joinLocalDateTime(date, time);
      if (next && isTimeUnavailable?.(next, boundary)) return;
      setValue({ ...value, [boundary]: next });
    };
    return (
      <div {...nativeProps} className={classNames(styles.root, block && styles.block, className)} ref={assignRef} role="group">
        {label ? <div className={styles.label}>{label}{required ? " *" : null}</div> : null}
        <div className={styles.boundaries}>
          <div className={styles.boundary}>
            <DateInput
              aria-label={typeof label === "string" ? `${label}: ${locale?.startsWith("ru") ? "начало" : "start"}` : undefined}
              disabled={disabled}
              isDateUnavailable={isDateUnavailable}
              locale={locale}
              maxDate={maxValue?.slice(0, 10) as DateValue | undefined}
              minDate={minValue?.slice(0, 10) as DateValue | undefined}
              onChange={(date) => update("from", date, fromTime ?? defaultStartTime)}
              readOnly={readOnly}
              value={fromDate}
            />
            <TimeInput
              aria-label={locale?.startsWith("ru") ? "Время начала" : "Start time"}
              disabled={disabled}
              minuteStep={minuteStep}
              onChange={(time) => update("from", fromDate, time)}
              readOnly={readOnly}
              value={fromTime}
            />
          </div>
          <div className={styles.boundary}>
            <DateInput
              aria-label={typeof label === "string" ? `${label}: ${locale?.startsWith("ru") ? "окончание" : "end"}` : undefined}
              disabled={disabled}
              isDateUnavailable={isDateUnavailable}
              locale={locale}
              maxDate={maxValue?.slice(0, 10) as DateValue | undefined}
              minDate={minValue?.slice(0, 10) as DateValue | undefined}
              onChange={(date) => update("to", date, toTime ?? defaultEndTime)}
              readOnly={readOnly}
              value={toDate}
            />
            <TimeInput
              aria-label={locale?.startsWith("ru") ? "Время окончания" : "End time"}
              disabled={disabled}
              minuteStep={minuteStep}
              onChange={(time) => update("to", toDate, time)}
              readOnly={readOnly}
              value={toTime}
            />
          </div>
        </div>
        {fromName ? <input disabled={disabled} name={fromName} type="hidden" value={value.from ?? ""} /> : null}
        {toName ? <input disabled={disabled} name={toName} type="hidden" value={value.to ?? ""} /> : null}
        {error ? <div className={classNames(styles.message, styles.error)}>{error}</div> : hint ? <div className={styles.message}>{hint}</div> : null}
      </div>
    );
  }
);
