import { fractionDigitsFromMinority } from "./minorUnits";
import { resolveLocale } from "../locale/resolveLocale";
import { getNumberFormatter } from "../locale/numberFormat";
import type { AmountFormatConfig } from "./types";

export interface ResolvedAmountFormat {
  currency: string | null;
  currencySeparator: string;
  currencyPosition: "prefix" | "suffix";
  decimalSeparator: string;
  fractionDigits: number;
  groupSeparator: string;
  locale: string;
  minority: number;
}

function currencyFormatter(
  locale: string,
  currency: string
): Intl.NumberFormat | null {
  try {
    return getNumberFormatter(locale, {
      currency,
      currencyDisplay: "narrowSymbol",
      style: "currency"
    });
  } catch {
    return null;
  }
}

export function resolveAmountFormat(
  config: AmountFormatConfig
): ResolvedAmountFormat {
  const locale = resolveLocale(config.locale);
  const numberParts = getNumberFormatter(locale).formatToParts(12345.6);
  const groupSeparator = numberParts.find((part) => part.type === "group")?.value
    ?? "";
  const decimalSeparator = numberParts.find((part) => part.type === "decimal")?.value
    ?? ".";

  let fractionDigits = config.minority == null
    ? 2
    : fractionDigitsFromMinority(config.minority);
  let currency: string | null = null;
  let currencySeparator = "";
  let currencyPosition: "prefix" | "suffix" = "suffix";

  if (config.currency) {
    const formatter = currencyFormatter(locale, config.currency);
    if (!formatter) {
      return {
        currency: config.currency,
        currencyPosition: "suffix",
        currencySeparator: "\u00a0",
        decimalSeparator,
        fractionDigits,
        groupSeparator,
        locale,
        minority: config.minority ?? 10 ** fractionDigits
      };
    }
    const parts = formatter.formatToParts(1);
    const currencyPartIndex = parts.findIndex((part) => part.type === "currency");
    const integerPartIndex = parts.findIndex((part) => part.type === "integer");
    const currencyPart = parts[currencyPartIndex];
    currency = currencyPart?.value ?? config.currency;
    currencyPosition = currencyPartIndex < integerPartIndex ? "prefix" : "suffix";
    const adjacentPart = currencyPosition === "prefix"
      ? parts[currencyPartIndex + 1]
      : parts[currencyPartIndex - 1];
    currencySeparator = adjacentPart?.type === "literal"
      ? adjacentPart.value
      : "";

    if (config.minority == null) {
      fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    }
  }

  return {
    currency,
    currencySeparator,
    currencyPosition,
    decimalSeparator,
    fractionDigits,
    groupSeparator,
    locale,
    minority: config.minority ?? 10 ** fractionDigits
  };
}
