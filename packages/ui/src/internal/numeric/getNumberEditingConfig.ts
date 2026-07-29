import { getNumberFormatter } from "../locale/numberFormat";
import type { NumberEditingConfig } from "./types";

export function getNumberEditingConfig(
  locale: string,
  allowNegative: boolean,
  maximumFractionDigits: number,
): NumberEditingConfig {
  const parts = getNumberFormatter(locale).formatToParts(12345.6);

  return {
    allowNegative,
    integerDigits: 16,
    maximumFractionDigits,
    decimalSeparator:
      parts.find((part) => part.type === "decimal")?.value ?? ".",
    groupSeparator:
      parts.find((part) => part.type === "group")?.value ?? ",",
  };
}
