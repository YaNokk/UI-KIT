import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode
} from "react";
import { Input } from "../Input/Input";
import type { DateInputCorrection } from "../DateInput/DateInput";
import type { MinuteStep } from "../TimeInput/TimeInput";
import { getDateInputPlaceholder, getTimeInputPlaceholder } from "../internal/date/dateFormatting";
import { isDateAllowed, isTimeAllowed } from "../internal/date/dateValidation";
import { useDateInputMask } from "../internal/date/input-mask/useDateInputMask";
import { createDateTimeRangeInputMask } from "../internal/date/range-input/createDateRangeInputMask";
import { DATE_RANGE_SEPARATOR } from "../internal/date/range-input/dateRangeInputTypes";
import { formatDateTimeRangeValue } from "../internal/date/range-input/formatDateRangeValue";
import { parseLocalizedDateTimeRange } from "../internal/date/range-input/parseLocalizedDateRange";
import { resolveDateMessages } from "../internal/date/resolveDateMessages";
import type { DateTimeRangeValue, DateValue, LocalDateTimeValue, TimeValue } from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { useNativeFormReset } from "../internal/date/useNativeFormReset";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import type { FieldLabelView, FieldSize } from "../shared/field";

const EMPTY_RANGE: DateTimeRangeValue = { from: null, to: null };

export interface DateTimeRangeInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "name"
> {
  value?: DateTimeRangeValue;
  defaultValue?: DateTimeRangeValue;
  onChange?: (value: DateTimeRangeValue) => void;
  onInputValueChange?: (value: string) => void;
  minuteStep?: MinuteStep;
  minValue?: LocalDateTimeValue | undefined;
  maxValue?: LocalDateTimeValue | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  isTimeUnavailable?: ((value: LocalDateTimeValue, boundary: "from" | "to") => boolean) | undefined;
  correction?: DateInputCorrection;
  fromName?: string | undefined;
  toName?: string | undefined;
  locale?: string | undefined;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  labelView?: FieldLabelView;
  size?: FieldSize;
  block?: boolean | undefined;
}

export const DateTimeRangeInput = forwardRef<HTMLInputElement, DateTimeRangeInputProps>(
  function DateTimeRangeInput({
    value: controlledValue,
    defaultValue = EMPTY_RANGE,
    onChange,
    onInputValueChange,
    minuteStep = 1,
    minValue,
    maxValue,
    isDateUnavailable,
    isTimeUnavailable,
    correction = "restore-last-valid",
    fromName,
    toName,
    locale: explicitLocale,
    error,
    form,
    lang,
    placeholder,
    onBlur,
    disabled = false,
    block = false,
    ...inputProps
  }, forwardedRef) {
    const locale = useResolvedLocale(explicitLocale);
    const messages = resolveDateMessages(locale);
    const [value, setValue] = useControllableValue(controlledValue, defaultValue, onChange);
    const [text, setText] = useState(() => formatDateTimeRangeValue(value, locale));
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const maskRef = useDateInputMask(useMemo(() => createDateTimeRangeInputMask(locale), [locale]));

    useEffect(() => {
      if (!focused) setText(formatDateTimeRangeValue(value, locale));
    }, [focused, locale, value]);
    const restore = useCallback(() => {
      setText(formatDateTimeRangeValue(defaultValue, locale));
      if (controlledValue === undefined) setValue(defaultValue);
    }, [controlledValue, defaultValue, locale, setValue]);
    useNativeFormReset(inputRef, restore);

    const assignRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      maskRef(node);
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };
    const validBoundary = (candidate: LocalDateTimeValue, boundary: "from" | "to") => (
      isDateAllowed(candidate.slice(0, 10) as DateValue, { isDateUnavailable })
      && isTimeAllowed(candidate.slice(11, 16) as TimeValue, { minuteStep })
      && (!minValue || candidate >= minValue)
      && (!maxValue || candidate <= maxValue)
      && !isTimeUnavailable?.(candidate, boundary)
    );
    const validRange = (candidate: DateTimeRangeValue) => Boolean(
      candidate.from && candidate.to
      && candidate.from <= candidate.to
      && validBoundary(candidate.from, "from")
      && validBoundary(candidate.to, "to")
    );
    const commitText = (next: string) => {
      setText(next);
      onInputValueChange?.(next);
      if (!next) {
        setValue(EMPTY_RANGE);
        return;
      }
      const parsed = parseLocalizedDateTimeRange(next, locale);
      if (parsed && validRange(parsed)) setValue(parsed);
    };
    const rangeError = value.from && value.to && value.from > value.to ? messages.invalidRange : undefined;
    const visibleError = error !== undefined ? error : rangeError;
    const dateTimePlaceholder = `${getDateInputPlaceholder(locale)}, ${getTimeInputPlaceholder(locale)}`;

    return (
      <>
        <Input
          {...inputProps}
          autoComplete="off"
          block={block}
          disabled={disabled}
          error={visibleError}
          form={form}
          inputMode="numeric"
          lang={lang ?? locale}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            const parsed = parseLocalizedDateTimeRange(text, locale);
            if (parsed && validRange(parsed)) setText(formatDateTimeRangeValue(parsed, locale));
            else if (correction === "restore-last-valid") setText(formatDateTimeRangeValue(value, locale));
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onInput={(event) => commitText(event.currentTarget.value)}
          placeholder={placeholder ?? `${dateTimePlaceholder}${DATE_RANGE_SEPARATOR}${dateTimePlaceholder}`}
          ref={assignRef}
          value={text}
        />
        {fromName ? <input disabled={disabled} form={form} name={fromName} type="hidden" value={value.from ?? ""} /> : null}
        {toName ? <input disabled={disabled} form={form} name={toName} type="hidden" value={value.to ?? ""} /> : null}
      </>
    );
  }
);
