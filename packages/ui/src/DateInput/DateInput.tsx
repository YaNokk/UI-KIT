import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode
} from "react";
import { Input } from "../Input/Input";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import {
  formatDateValue,
  getDateInputPlaceholder,
  parseLocalizedDate
} from "../internal/date/dateFormatting";
import { isDateAllowed } from "../internal/date/dateValidation";
import { useControllableValue } from "../internal/date/useControllableValue";
import { useNativeFormReset } from "../internal/date/useNativeFormReset";
import type { DateValue } from "../internal/date/types";
import type { FieldLabelView, FieldSize } from "../shared/field";

export type DateInputCorrection = "none" | "restore-last-valid" | "clamp";

export interface DateInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> {
  value?: DateValue | null;
  defaultValue?: DateValue | null;
  onChange?: (value: DateValue | null) => void;
  onInputValueChange?: (value: string) => void;
  minDate?: DateValue | undefined;
  maxDate?: DateValue | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  correction?: DateInputCorrection;
  locale?: string | undefined;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  labelView?: FieldLabelView;
  size?: FieldSize;
  block?: boolean;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput(
    {
      defaultValue = null,
      value: controlledValue,
      onChange,
      onInputValueChange,
      minDate,
      maxDate,
      isDateUnavailable,
      correction = "restore-last-valid",
      block = false,
      locale: explicitLocale,
      name,
      form,
      placeholder,
      onBlur,
      onFocus,
      readOnly = false,
      disabled = false,
      ...inputProps
    },
    forwardedRef
  ) {
    const locale = useResolvedLocale(explicitLocale);
    const initialValue = defaultValue;
    const [value, setValue] = useControllableValue(controlledValue, initialValue, onChange);
    const [text, setText] = useState(() => formatDateValue(value, locale));
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (!focused) setText(formatDateValue(value, locale));
    }, [focused, locale, value]);

    const restore = useCallback(() => {
      setText(formatDateValue(initialValue, locale));
      if (controlledValue === undefined) setValue(initialValue);
    }, [controlledValue, initialValue, locale, setValue]);
    useNativeFormReset(inputRef, restore);

    const assignRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const commitText = (nextText: string) => {
      onInputValueChange?.(nextText);
      setText(nextText);
      if (nextText.trim() === "") {
        if (value !== null) setValue(null);
        return;
      }
      const parsed = parseLocalizedDate(nextText, locale);
      if (parsed && isDateAllowed(parsed, { minDate, maxDate, isDateUnavailable })) {
        if (parsed !== value) setValue(parsed);
      }
    };

    const correctText = () => {
      if (text.trim() === "") return;
      const parsed = parseLocalizedDate(text, locale);
      if (parsed && isDateAllowed(parsed, { minDate, maxDate, isDateUnavailable })) {
        setText(formatDateValue(parsed, locale));
        return;
      }
      if (correction === "clamp" && parsed && !isDateUnavailable?.(parsed)) {
        const clamped = minDate && parsed < minDate ? minDate : maxDate && parsed > maxDate ? maxDate : null;
        if (clamped) {
          setValue(clamped);
          setText(formatDateValue(clamped, locale));
          return;
        }
      }
      if (correction === "restore-last-valid") setText(formatDateValue(value, locale));
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
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            correctText();
            onBlur?.(event);
          }}
          onChange={(event) => commitText(event.currentTarget.value)}
          onFocus={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholder={placeholder ?? getDateInputPlaceholder(locale)}
          readOnly={readOnly}
          ref={assignRef}
          value={text}
        />
        {name ? <input disabled={disabled} form={form} name={name} type="hidden" value={value ?? ""} /> : null}
      </>
    );
  }
);
