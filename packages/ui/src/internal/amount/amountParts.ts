import { assertAmountValue, minorToDecimalString } from "./minorUnits";
import { resolveAmountFormat } from "./currency";
import type { AmountFormatConfig, AmountParts, AmountValue } from "./types";

export function getAmountParts(
  value: AmountValue,
  config: AmountFormatConfig & {
    showPlus?: boolean;
    trimTrailingZeros?: boolean;
  }
): AmountParts {
  assertAmountValue(value);
  const resolved = resolveAmountFormat(config);
  const decimal = minorToDecimalString(
    Math.abs(value),
    resolved.minority,
    config.trimTrailingZeros
  );
  const [major = "0", minor = ""] = decimal.split(".");
  const formattedMajor = new Intl.NumberFormat(resolved.locale, {
    maximumFractionDigits: 0,
    useGrouping: true
  }).format(Number(major));

  return {
    currency: resolved.currency,
    currencySeparator: resolved.currencySeparator,
    currencyPosition: resolved.currencyPosition,
    decimalSeparator: resolved.decimalSeparator,
    fractionDigits: resolved.fractionDigits,
    groupSeparator: resolved.groupSeparator,
    major: formattedMajor,
    minor,
    sign: value < 0 ? "-" : value > 0 && config.showPlus ? "+" : ""
  };
}
