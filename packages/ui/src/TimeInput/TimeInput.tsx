import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode
} from "react";
import { Input } from "../Input/Input";
import { parseTimeValue } from "../internal/date/parseTimeValue";
import { isTimeAllowed } from "../internal/date/dateValidation";
import { useControllableValue } from "../internal/date/useControllableValue";
import { useNativeFormReset } from "../internal/date/useNativeFormReset";
import type { TimeValue } from "../internal/date/types";
import type { FieldLabelView, FieldSize } from "../shared/field";

export type MinuteStep = 1 | 5 | 10 | 15 | 30;

export interface TimeInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> {
  value?: TimeValue | null;
  defaultValue?: TimeValue | null;
  onChange?: (value: TimeValue | null) => void;
  onInputValueChange?: (value: string) => void;
  minuteStep?: MinuteStep;
  minTime?: TimeValue | undefined;
  maxTime?: TimeValue | undefined;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  labelView?: FieldLabelView;
  size?: FieldSize;
  block?: boolean;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  function TimeInput(
    {
      defaultValue = null,
      value: controlledValue,
      onChange,
      onInputValueChange,
      minuteStep = 1,
      minTime,
      maxTime,
      name,
      form,
      disabled = false,
      onBlur,
      ...props
    },
    forwardedRef
  ) {
    const initialValue = defaultValue;
    const [value, setValue] = useControllableValue(controlledValue, initialValue, onChange);
    const [text, setText] = useState(value ?? "");
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => { if (!focused) setText(value ?? ""); }, [focused, value]);
    const restore = useCallback(() => {
      setText(initialValue ?? "");
      if (controlledValue === undefined) setValue(initialValue);
    }, [controlledValue, initialValue, setValue]);
    useNativeFormReset(inputRef, restore);

    const assignRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    return (
      <>
        <Input
          {...props}
          autoComplete="off"
          disabled={disabled}
          form={form}
          inputMode="numeric"
          onBlur={(event) => {
            setFocused(false);
            if (text && !isTimeAllowed(text as TimeValue, { minuteStep, minTime, maxTime })) {
              setText(value ?? "");
            }
            onBlur?.(event);
          }}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setText(next);
            onInputValueChange?.(next);
            if (!next) setValue(null);
            else if (parseTimeValue(next) && isTimeAllowed(next as TimeValue, { minuteStep, minTime, maxTime })) {
              setValue(next as TimeValue);
            }
          }}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          placeholder="HH:mm"
          ref={assignRef}
          value={text}
        />
        {name ? <input disabled={disabled} form={form} name={name} type="hidden" value={value ?? ""} /> : null}
      </>
    );
  }
);
