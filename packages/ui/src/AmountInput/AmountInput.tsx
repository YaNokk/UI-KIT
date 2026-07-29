import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent
} from "react";
import { Input, type InputProps } from "../Input/Input";
import { resolveAmountFormat } from "../internal/amount/currency";
import {
  decimalStringToMinor,
  minorToDecimalString
} from "../internal/amount/minorUnits";
import type { AmountValue } from "../internal/amount/types";
import { createNumberMask } from "../internal/numeric/createNumberMask";
import { formatNumericInput } from "../internal/numeric/formatNumericInput";
import { parseNumericInput } from "../internal/numeric/parseNumericInput";
import { useNumberEditing } from "../internal/numeric/useNumberEditing";
import type { NumberEditingConfig } from "../internal/numeric/types";

export interface AmountInputChangeMeta {
  inputValue: string;
}

export interface AmountInputProps
  extends Omit<
    InputProps,
    | "defaultValue"
    | "inputMode"
    | "onChange"
    | "type"
    | "value"
  > {
  allowNegative?: boolean;
  currency?: string;
  defaultValue?: AmountValue | null;
  fractionDisplay?: "auto" | "always";
  integerDigits?: number;
  locale?: string;
  minority?: number;
  onChange?: (
    value: AmountValue | null,
    meta: AmountInputChangeMeta
  ) => void;
  value?: AmountValue | null;
}

function editingValue(
  value: AmountValue | null | undefined,
  config: NumberEditingConfig,
  minority: number,
  fractionDisplay: "auto" | "always"
): string {
  if (value == null) return "";
  const decimal = minorToDecimalString(
    value,
    minority,
    fractionDisplay === "auto"
  );
  const [major, minor] = decimal.split(".");
  const completed = fractionDisplay === "always" && config.maximumFractionDigits > 0
    ? `${major}.${(minor ?? "").padEnd(config.maximumFractionDigits, "0")}`
    : decimal;
  return formatNumericInput(completed, config);
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  function AmountInput(
    {
      allowNegative = false,
      currency,
      defaultValue = null,
      fractionDisplay = "auto",
      integerDigits = 16,
      locale,
      minority,
      onBlur,
      onChange,
      value,
      ...inputProps
    },
    forwardedRef
  ) {
    const resolved = useMemo(
      () => resolveAmountFormat({
        ...(currency === undefined ? {} : { currency }),
        ...(locale === undefined ? {} : { locale }),
        ...(minority === undefined ? {} : { minority })
      }),
      [currency, locale, minority]
    );
    const numberConfig = useMemo<NumberEditingConfig>(
      () => {
        const currencyAffix = resolved.currency == null
          ? ""
          : `${resolved.currency}${resolved.currencySeparator}`;
        const currencyPostfix = resolved.currency == null
          ? ""
          : `${resolved.currencySeparator}${resolved.currency}`;

        return {
          allowNegative,
          decimalSeparator: resolved.decimalSeparator,
          groupSeparator: resolved.groupSeparator,
          integerDigits,
          maximumFractionDigits: resolved.fractionDigits,
          postfix: resolved.currencyPosition === "suffix" ? currencyPostfix : "",
          prefix: resolved.currencyPosition === "prefix" ? currencyAffix : ""
        };
      },
      [allowNegative, integerDigits, resolved]
    );
    const maskOptions = useMemo(() => createNumberMask(numberConfig), [numberConfig]);
    const maskRef = useNumberEditing(maskOptions);
    const nativeRef = useRef<HTMLInputElement | null>(null);
    const controlled = value !== undefined;
    const semanticValue = controlled ? value : undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<AmountValue | null>(
      defaultValue
    );
    const effectiveValue = controlled ? value : uncontrolledValue;
    const [inputValue, setInputValue] = useState(() =>
      editingValue(effectiveValue, numberConfig, resolved.minority, fractionDisplay)
    );
    const lastEmittedValue = useRef<AmountValue | null | undefined>(undefined);
    const previousFormat = useRef({
      fractionDisplay,
      numberConfig,
      minority: resolved.minority
    });

    useEffect(() => {
      const formatChanged = previousFormat.current.fractionDisplay !== fractionDisplay
        || previousFormat.current.numberConfig !== numberConfig
        || previousFormat.current.minority !== resolved.minority;
      previousFormat.current = {
        fractionDisplay,
        numberConfig,
        minority: resolved.minority
      };
      if (
        controlled
        && !formatChanged
        && Object.is(semanticValue, lastEmittedValue.current)
      ) {
        return;
      }
      setInputValue(
        editingValue(
          effectiveValue,
          numberConfig,
          resolved.minority,
          fractionDisplay
        )
      );
    }, [
      fractionDisplay,
      numberConfig,
      resolved.minority,
      semanticValue
    ]);

    const setRef = useCallback((node: HTMLInputElement | null) => {
      nativeRef.current = node;
      maskRef(node);
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef, maskRef]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const nextInputValue = event.currentTarget.value;
      const decimal = parseNumericInput(nextInputValue, numberConfig);
      const nextValue = decimal == null
        ? null
        : decimalStringToMinor(decimal, resolved.minority);
      lastEmittedValue.current = nextValue;
      setInputValue(nextInputValue);
      if (!controlled) setUncontrolledValue(nextValue);
      onChange?.(nextValue, { inputValue: nextInputValue });
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setInputValue(
        editingValue(
          effectiveValue,
          numberConfig,
          resolved.minority,
          fractionDisplay
        )
      );
      onBlur?.(event);
    };

    return (
      <Input
        {...inputProps}
        inputMode="decimal"
        onBlur={handleBlur}
        onChange={handleChange}
        ref={setRef}
        type="text"
        value={inputValue}
      />
    );
  }
);
