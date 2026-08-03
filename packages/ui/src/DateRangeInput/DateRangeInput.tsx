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
import { useDateInputMask } from "../internal/date/input-mask/useDateInputMask";
import { equalDateRanges } from "../internal/date/dateComparison";
import { isDateAllowed } from "../internal/date/dateValidation";
import { getDateInputPlaceholder } from "../internal/date/dateFormatting";
import { createDateRangeInputMask } from "../internal/date/range-input/createDateRangeInputMask";
import { DATE_RANGE_SEPARATOR } from "../internal/date/range-input/dateRangeInputTypes";
import { formatDateRangeValue } from "../internal/date/range-input/formatDateRangeValue";
import { parseLocalizedDateRange } from "../internal/date/range-input/parseLocalizedDateRange";
import type { DateRangeValue, DateValue } from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { useNativeFormReset } from "../internal/date/useNativeFormReset";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import type { FieldLabelView, FieldSize } from "../shared/field";

const EMPTY_RANGE: DateRangeValue = { from: null, to: null };

export interface DateRangeInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "name"
> {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  onInputValueChange?: (value: string) => void;
  minDate?: DateValue | undefined;
  maxDate?: DateValue | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
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

export const DateRangeInput = forwardRef<HTMLInputElement, DateRangeInputProps>(
  function DateRangeInput({
    value: controlledValue,
    defaultValue = EMPTY_RANGE,
    onChange,
    onInputValueChange,
    minDate,
    maxDate,
    isDateUnavailable,
    correction = "restore-last-valid",
    fromName,
    toName,
    locale: explicitLocale,
    form,
    lang,
    placeholder,
    onBlur,
    disabled = false,
    block = false,
    ...inputProps
  }, forwardedRef) {
    const locale = useResolvedLocale(explicitLocale);
    const [value, setValue] = useControllableValue(controlledValue, defaultValue, onChange);
    const [text, setText] = useState(() => formatDateRangeValue(value, locale));
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const renderedValueRef = useRef(value);
    const maskRef = useDateInputMask(useMemo(() => createDateRangeInputMask(locale), [locale]));

    useEffect(() => {
      if (!equalDateRanges(renderedValueRef.current, value)) {
        renderedValueRef.current = value;
        setText(formatDateRangeValue(value, locale));
        return;
      }
      if (!focused) setText(formatDateRangeValue(value, locale));
    }, [focused, locale, value]);
    const restore = useCallback(() => {
      setText(formatDateRangeValue(defaultValue, locale));
      if (controlledValue === undefined) setValue(defaultValue);
    }, [controlledValue, defaultValue, locale, setValue]);
    useNativeFormReset(inputRef, restore);

    const assignRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      maskRef(node);
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };
    const validRange = (candidate: DateRangeValue) => Boolean(
      candidate.from && candidate.to
      && candidate.from <= candidate.to
      && isDateAllowed(candidate.from, { minDate, maxDate, isDateUnavailable })
      && isDateAllowed(candidate.to, { minDate, maxDate, isDateUnavailable })
    );
    const commitText = (next: string) => {
      setText(next);
      onInputValueChange?.(next);
      if (!next) {
        setValue(EMPTY_RANGE);
        return;
      }
      const parsed = parseLocalizedDateRange(next, locale);
      if (parsed && validRange(parsed)) setValue(parsed);
    };

    return (
      <>
        <Input
          {...inputProps}
          autoComplete="off"
          block={block}
          disabled={disabled}
          form={form}
          inputMode="numeric"
          lang={lang ?? locale}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            const parsed = parseLocalizedDateRange(text, locale);
            if (parsed && validRange(parsed)) setText(formatDateRangeValue(parsed, locale));
            else if (correction === "restore-last-valid") setText(formatDateRangeValue(value, locale));
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onInput={(event) => commitText(event.currentTarget.value)}
          placeholder={placeholder ?? `${getDateInputPlaceholder(locale)}${DATE_RANGE_SEPARATOR}${getDateInputPlaceholder(locale)}`}
          ref={assignRef}
          value={text}
        />
        {fromName ? <input disabled={disabled} form={form} name={fromName} type="hidden" value={value.from ?? ""} /> : null}
        {toName ? <input disabled={disabled} form={form} name={toName} type="hidden" value={value.to ?? ""} /> : null}
      </>
    );
  }
);
