import { fractionDigitsFromMinority } from "./minorUnits";
import type { AmountFormatConfig } from "./types";

export interface ResolvedAmountFormat {
  currency: string | null;
  currencyPosition: "prefix" | "suffix";
  decimalSeparator: string;
  fractionDigits: number;
  groupSeparator: string;
  locale: string;
  minority: number;
  spaceBetweenCurrency: boolean;
}

function currencyFormatter(locale: string, currency: string): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale, {
      currency,
      currencyDisplay: "narrowSymbol",
      style: "currency"
    });
  } catch {
    throw new RangeError(`Unsupported currency code: ${currency}`);
  }
}

export function resolveAmountFormat(
  config: AmountFormatConfig
): ResolvedAmountFormat {
  const locale = config.locale ?? "ru-RU";
  const numberParts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const groupSeparator = numberParts.find((part) => part.type === "group")?.value
    ?? "\u00a0";
  const decimalSeparator = numberParts.find((part) => part.type === "decimal")?.value
    ?? ",";

  let fractionDigits = config.minority == null
    ? 2
    : fractionDigitsFromMinority(config.minority);
  let currency: string | null = null;
  let currencyPosition: "prefix" | "suffix" = "suffix";
  let spaceBetweenCurrency = true;

  if (config.currency) {
    const formatter = currencyFormatter(locale, config.currency);
    const parts = formatter.formatToParts(1);
    const currencyPartIndex = parts.findIndex((part) => part.type === "currency");
    const integerPartIndex = parts.findIndex((part) => part.type === "integer");
    const currencyPart = parts[currencyPartIndex];
    currency = currencyPart?.value ?? config.currency;
    currencyPosition = currencyPartIndex < integerPartIndex ? "prefix" : "suffix";
    const adjacentPart = currencyPosition === "prefix"
      ? parts[currencyPartIndex + 1]
      : parts[currencyPartIndex - 1];
    spaceBetweenCurrency = adjacentPart?.type === "literal";

    if (config.minority == null) {
      fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    }
  }

  return {
    currency,
    currencyPosition,
    decimalSeparator,
    fractionDigits,
    groupSeparator,
    locale,
    minority: config.minority ?? 10 ** fractionDigits,
    spaceBetweenCurrency
  };
}
