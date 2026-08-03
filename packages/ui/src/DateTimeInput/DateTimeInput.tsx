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
import {
  formatLocalDateTimeValue,
  getDateInputPlaceholder,
  parseLocalizedDateTime
} from "../internal/date/dateFormatting";
import { createDateTimeInputMask } from "../internal/date/input-mask/dateTimeInputMask";
import { useDateInputMask } from "../internal/date/input-mask/useDateInputMask";
import { isDateAllowed, isTimeAllowed } from "../internal/date/dateValidation";
import type { DateValue, LocalDateTimeValue, TimeValue } from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { useNativeFormReset } from "../internal/date/useNativeFormReset";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import type { FieldLabelView, FieldSize } from "../shared/field";

export interface DateTimeInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> {
  value?: LocalDateTimeValue | null;
  defaultValue?: LocalDateTimeValue | null;
  onChange?: (value: LocalDateTimeValue | null) => void;
  onInputValueChange?: (value: string) => void;
  locale?: string | undefined;
  minuteStep?: MinuteStep;
  minValue?: LocalDateTimeValue | undefined;
  maxValue?: LocalDateTimeValue | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  isTimeUnavailable?: ((value: LocalDateTimeValue) => boolean) | undefined;
  correction?: DateInputCorrection;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  labelView?: FieldLabelView;
  size?: FieldSize;
  block?: boolean;
}

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  function DateTimeInput(
    {
      value: controlledValue,
      defaultValue = null,
      onChange,
      onInputValueChange,
      locale: explicitLocale,
      minuteStep = 1,
      minValue,
      maxValue,
      isDateUnavailable,
      isTimeUnavailable,
      correction = "restore-last-valid",
      name,
      form,
      lang,
      placeholder,
      onBlur,
      onFocus,
      disabled = false,
      block = false,
      ...inputProps
    },
    forwardedRef
  ) {
    const locale = useResolvedLocale(explicitLocale);
    const [value, setValue] = useControllableValue(controlledValue, defaultValue, onChange);
    const [text, setText] = useState(() => formatLocalDateTimeValue(value, locale));
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const maskOptions = useMemo(() => createDateTimeInputMask(locale), [locale]);
    const maskRef = useDateInputMask(maskOptions);

    useEffect(() => {
      if (!focused) setText(formatLocalDateTimeValue(value, locale));
    }, [focused, locale, value]);

    const restore = useCallback(() => {
      setText(formatLocalDateTimeValue(defaultValue, locale));
      if (controlledValue === undefined) setValue(defaultValue);
    }, [controlledValue, defaultValue, locale, setValue]);
    useNativeFormReset(inputRef, restore);

    const assignRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      maskRef(node);
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const validValue = (candidate: LocalDateTimeValue) => {
      const date = candidate.slice(0, 10) as DateValue;
      const time = candidate.slice(11, 16) as TimeValue;
      return isDateAllowed(date, { isDateUnavailable })
        && isTimeAllowed(time, { minuteStep })
        && (!minValue || candidate >= minValue)
        && (!maxValue || candidate <= maxValue)
        && !isTimeUnavailable?.(candidate);
    };

    const commitText = (nextText: string) => {
      setText(nextText);
      onInputValueChange?.(nextText);
      if (!nextText) {
        setValue(null);
        return;
      }
      const parsed = parseLocalizedDateTime(nextText, locale);
      if (parsed && validValue(parsed) && parsed !== value) setValue(parsed);
    };

    const correctText = () => {
      if (!text) return;
      const parsed = parseLocalizedDateTime(text, locale);
      if (parsed && validValue(parsed)) {
        setText(formatLocalDateTimeValue(parsed, locale));
        return;
      }
      if (correction === "clamp" && parsed && !isDateUnavailable?.(parsed.slice(0, 10) as DateValue)) {
        const clamped = minValue && parsed < minValue ? minValue : maxValue && parsed > maxValue ? maxValue : null;
        if (clamped && validValue(clamped)) {
          setValue(clamped);
          setText(formatLocalDateTimeValue(clamped, locale));
          return;
        }
      }
      if (correction === "restore-last-valid") setText(formatLocalDateTimeValue(value, locale));
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
            correctText();
            onBlur?.(event);
          }}
          onInput={(event) => commitText(event.currentTarget.value)}
          onFocus={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholder={placeholder ?? `${getDateInputPlaceholder(locale)}, HH:mm`}
          ref={assignRef}
          value={text}
        />
        {name ? <input disabled={disabled} form={form} name={name} type="hidden" value={value ?? ""} /> : null}
      </>
    );
  }
);
