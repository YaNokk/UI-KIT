import type { HTMLAttributes } from "react";
import { classNames } from "../shared/classNames";
import { getAmountParts } from "../internal/amount/amountParts";
import type { AmountValue } from "../internal/amount/types";
import styles from "./Amount.module.css";

export type AmountSize = "sm" | "md" | "lg";
export type AmountMinorTone = "same" | "secondary";

export interface AmountProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "color" | "style"> {
  currency?: string;
  locale?: string;
  minority?: number;
  minorTone?: AmountMinorTone;
  showPlus?: boolean;
  size?: AmountSize;
  trimTrailingZeros?: boolean;
  value: AmountValue;
}

const sizeClasses: Record<AmountSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg
};

export function Amount({
  className,
  currency,
  locale,
  minority,
  minorTone = "same",
  showPlus = false,
  size = "md",
  trimTrailingZeros = false,
  value,
  ...nativeProps
}: AmountProps) {
  const parts = getAmountParts(value, {
    ...(currency === undefined ? {} : { currency }),
    ...(locale === undefined ? {} : { locale }),
    ...(minority === undefined ? {} : { minority }),
    showPlus,
    trimTrailingZeros
  });
  const currencyGap = parts.currencySeparator;
  const currencyNode = parts.currency == null ? null : (
    <span className={styles.currency} data-amount-part="currency">
      {parts.currency}
    </span>
  );

  return (
    <span
      {...nativeProps}
      className={classNames(
        styles.root,
        sizeClasses[size],
        minorTone === "secondary" && styles.secondaryMinor,
        className
      )}
    >
      <span data-amount-part="sign">{parts.sign}</span>
      {parts.currencyPosition === "prefix" ? currencyNode : null}
      {parts.currencyPosition === "prefix" ? currencyGap : null}
      <span data-amount-part="major">{parts.major}</span>
      {parts.minor ? (
        <span className={styles.minor} data-amount-part="minor">
          {parts.decimalSeparator}{parts.minor}
        </span>
      ) : null}
      {parts.currencyPosition === "suffix" ? currencyGap : null}
      {parts.currencyPosition === "suffix" ? currencyNode : null}
    </span>
  );
}
