import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { Minus, Plus } from "lucide-react";
import {
  IconButton,
  NumberInput,
  type NumberInputProps,
  type NumberInputStepActions,
} from "@mypoint/ui";
import styles from "./QuantityInput.module.css";

export interface QuantityInputProps
  extends Omit<
    NumberInputProps,
    | "className"
    | "defaultValue"
    | "endAdornment"
    | "error"
    | "hint"
    | "label"
    | "labelView"
    | "onChange"
    | "size"
    | "startAdornment"
    | "value"
  > {
  "aria-label": string;
  className?: string;
  decreaseLabel: string;
  defaultValue?: number | null;
  increaseLabel: string;
  onChange?: (value: number | null) => void;
  value?: number | null;
}

export const QuantityInput = forwardRef<
  HTMLInputElement,
  QuantityInputProps
>(function QuantityInput(
  {
    "aria-label": ariaLabel,
    allowNegative = false,
    className,
    decreaseLabel,
    defaultValue = null,
    disabled = false,
    increaseLabel,
    maximumFractionDigits = 0,
    max,
    min,
    onBlur,
    onChange,
    readOnly = false,
    step = 1,
    value,
    ...inputProps
  },
  forwardedRef,
) {
  const controlled = value !== undefined;
  const stepActionsRef = useRef<NumberInputStepActions | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(
    defaultValue,
  );
  const effectiveValue = controlled ? value : uncontrolledValue;
  const latestValue = useRef(effectiveValue);

  useEffect(() => {
    latestValue.current = effectiveValue;
  }, [effectiveValue]);

  const emitValue = useCallback(
    (nextValue: number | null) => {
      latestValue.current = nextValue;
      if (!controlled) setUncontrolledValue(nextValue);
      onChange?.(nextValue);
    },
    [controlled, onChange],
  );

  const stepValue = (direction: 1 | -1) => {
    if (direction === 1) stepActionsRef.current?.increment();
    else stepActionsRef.current?.decrement();
  };

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    if (latestValue.current === null && min !== undefined) {
      emitValue(min);
    }
  };

  const unavailable = disabled || readOnly;
  const decrementDisabled =
    unavailable ||
    (effectiveValue !== null &&
      min !== undefined &&
      effectiveValue <= min);
  const incrementDisabled =
    unavailable ||
    (effectiveValue !== null &&
      max !== undefined &&
      effectiveValue >= max);

  return (
    <div
      aria-label={ariaLabel}
      className={[styles.root, className].filter(Boolean).join(" ")}
      role="group"
    >
      <IconButton
        aria-label={decreaseLabel}
        disabled={decrementDisabled}
        icon={<Minus />}
        onClick={() => stepValue(-1)}
        size="sm"
        variant="secondary"
      />
      <NumberInput
        {...inputProps}
        allowNegative={allowNegative}
        aria-label={ariaLabel}
        className={styles.input}
        disabled={disabled}
        maximumFractionDigits={maximumFractionDigits}
        {...(max === undefined ? {} : { max })}
        {...(min === undefined ? {} : { min })}
        onBlur={handleBlur}
        onChange={(nextValue) => emitValue(nextValue)}
        readOnly={readOnly}
        ref={setInputRef}
        size="sm"
        step={step}
        stepActionsRef={stepActionsRef}
        value={effectiveValue}
      />
      <IconButton
        aria-label={increaseLabel}
        disabled={incrementDisabled}
        icon={<Plus />}
        onClick={() => stepValue(1)}
        size="sm"
        variant="secondary"
      />
    </div>
  );
});
