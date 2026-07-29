import { getAmountParts } from "./amountParts";
import type { AmountFormatConfig, AmountValue } from "./types";

export function formatAmount(
  value: AmountValue,
  config: AmountFormatConfig & {
    showPlus?: boolean;
    trimTrailingZeros?: boolean;
  } = {}
): string {
  const parts = getAmountParts(value, config);
  const number = `${parts.major}${
    parts.minor ? `${parts.decimalSeparator}${parts.minor}` : ""
  }`;
  if (!parts.currency) return `${parts.sign}${number}`;
  const gap = parts.currencySeparator;
  return parts.currencyPosition === "prefix"
    ? `${parts.sign}${parts.currency}${gap}${number}`
    : `${parts.sign}${number}${gap}${parts.currency}`;
}
