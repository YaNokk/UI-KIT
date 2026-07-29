import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
} from "react";
import { Input, type InputProps } from "../Input/Input";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import { createNumberMask } from "../internal/numeric/createNumberMask";
import { getNumberEditingConfig } from "../internal/numeric/getNumberEditingConfig";
import {
  clampNumber,
  formatNumberEditingValue,
  validateFractionDigits,
} from "../internal/numeric/numberValue";
import { parseNumericInput } from "../internal/numeric/parseNumericInput";
import { stepNumber, type StepDirection } from "../internal/numeric/stepNumber";
import { useNumberEditing } from "../internal/numeric/useNumberEditing";

export interface NumberInputChangeMeta {
  inputValue: string;
}

export interface NumberInputActions {
  decrement(): void;
  increment(): void;
}

export interface NumberInputProps
  extends Omit<
    InputProps,
    | "defaultValue"
    | "inputMode"
    | "max"
    | "min"
    | "onChange"
    | "step"
    | "type"
    | "value"
  > {
  allowNegative?: boolean;
  defaultValue?: number | null;
  locale?: string;
  maximumFractionDigits?: number;
  max?: number;
  minimumFractionDigits?: number;
  min?: number;
  onChange?: (value: number | null, meta: NumberInputChangeMeta) => void;
  step?: number;
  actionsRef?: Ref<NumberInputActions>;
  value?: number | null;
}

function semanticNumber(inputValue: string, decimalSeparator: string, groupSeparator: string) {
  const decimal = parseNumericInput(inputValue, {
    decimalSeparator,
    groupSeparator,
  });

  if (decimal === null || decimal === "-") {
    return null;
  }

  if (decimal.endsWith(".")) {
    return null;
  }

  const value = Number(decimal);
  return Number.isFinite(value) ? value : null;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      actionsRef,
      allowNegative = false,
      defaultValue = null,
      disabled = false,
      locale,
      maximumFractionDigits = 3,
      max,
      minimumFractionDigits = 0,
      min,
      onBlur,
      onChange,
      onKeyDown,
      readOnly = false,
      step = 1,
      value,
      ...inputProps
    },
    forwardedRef,
  ) {
    validateFractionDigits(minimumFractionDigits, maximumFractionDigits);
    const resolvedLocale = useResolvedLocale(locale);
    const numberConfig = useMemo(
      () =>
        getNumberEditingConfig(
          resolvedLocale,
          allowNegative,
          maximumFractionDigits,
        ),
      [allowNegative, maximumFractionDigits, resolvedLocale],
    );
    const maskOptions = useMemo(
      () => createNumberMask(numberConfig),
      [numberConfig],
    );
    const maskRef = useNumberEditing(maskOptions);
    const nativeRef = useRef<HTMLInputElement | null>(null);
    const controlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(
      defaultValue,
    );
    const effectiveValue = controlled ? value : uncontrolledValue;
    const formatValue = useCallback(
      (nextValue: number | null) =>
        formatNumberEditingValue(
          nextValue,
          numberConfig,
          minimumFractionDigits,
        ),
      [minimumFractionDigits, numberConfig],
    );
    const [inputValue, setInputValue] = useState(() =>
      formatNumberEditingValue(
        effectiveValue,
        numberConfig,
        minimumFractionDigits,
      ),
    );
    const lastEmittedValue = useRef<number | null | undefined>(undefined);
    const previousFormat = useRef({
      minimumFractionDigits,
      numberConfig,
    });

    useEffect(() => {
      const formatChanged =
        previousFormat.current.minimumFractionDigits !==
          minimumFractionDigits ||
        previousFormat.current.numberConfig !== numberConfig;
      previousFormat.current = { minimumFractionDigits, numberConfig };

      if (!controlled && !formatChanged) {
        return;
      }

      if (
        controlled &&
        !formatChanged &&
        Object.is(value, lastEmittedValue.current)
      ) {
        return;
      }

      setInputValue(formatValue(effectiveValue));
    }, [
      controlled,
      effectiveValue,
      formatValue,
      inputValue,
      minimumFractionDigits,
      numberConfig,
      value,
    ]);

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        nativeRef.current = node;
        maskRef(node);
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef, maskRef],
    );

    const emitValue = useCallback(
      (nextValue: number | null, nextInputValue: string) => {
        lastEmittedValue.current = nextValue;
        setInputValue(nextInputValue);
        if (!controlled) setUncontrolledValue(nextValue);
        onChange?.(nextValue, { inputValue: nextInputValue });
      },
      [controlled, onChange],
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const nextInputValue = event.currentTarget.value;
      const nextValue = semanticNumber(
        nextInputValue,
        numberConfig.decimalSeparator,
        numberConfig.groupSeparator,
      );
      emitValue(nextValue, nextInputValue);
    };

    const currentEditingValue = useCallback(() => {
      const currentInputValue = nativeRef.current?.value ?? inputValue;
      return semanticNumber(
        currentInputValue,
        numberConfig.decimalSeparator,
        numberConfig.groupSeparator,
      );
    }, [inputValue, numberConfig.decimalSeparator, numberConfig.groupSeparator]);

    const applyStep = useCallback(
      (direction: StepDirection) => {
        const editingValue = currentEditingValue();
        const nextValue = stepNumber({
          allowNegative,
          direction,
          maximumFractionDigits,
          ...(max === undefined ? {} : { max }),
          ...(min === undefined ? {} : { min }),
          step,
          value: editingValue,
        });
        if (Object.is(nextValue, editingValue)) return;
        emitValue(nextValue, formatValue(nextValue));
      },
      [
        allowNegative,
        currentEditingValue,
        emitValue,
        formatValue,
        maximumFractionDigits,
        max,
        min,
        step,
      ],
    );

    const requestStep = useCallback(
      (direction: StepDirection) => {
        if (!disabled && !readOnly) applyStep(direction);
      },
      [applyStep, disabled, readOnly],
    );

    useImperativeHandle(
      actionsRef,
      () => ({
        decrement: () => requestStep(-1),
        increment: () => requestStep(1),
      }),
      [requestStep],
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      if (
        event.defaultPrevented ||
        disabled ||
        readOnly ||
        (event.key !== "ArrowUp" && event.key !== "ArrowDown")
      ) {
        return;
      }

      event.preventDefault();
      requestStep(event.key === "ArrowUp" ? 1 : -1);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      const editingValue = currentEditingValue();
      const committedValue =
        editingValue === null ? null : clampNumber(editingValue, min, max);
      const committedInputValue = formatValue(committedValue);

      if (!Object.is(committedValue, editingValue)) {
        emitValue(committedValue, committedInputValue);
      } else {
        setInputValue(committedInputValue);
      }

      onBlur?.(event);
    };

    return (
      <Input
        {...inputProps}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={
          semanticNumber(
            inputValue,
            numberConfig.decimalSeparator,
            numberConfig.groupSeparator,
          ) ?? undefined
        }
        disabled={disabled}
        inputMode={maximumFractionDigits === 0 ? "numeric" : "decimal"}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        ref={setRef}
        role="spinbutton"
        type="text"
        value={inputValue}
      />
    );
  },
);
