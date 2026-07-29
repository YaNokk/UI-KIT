import type { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import type { NumberEditingConfig } from "./types";

export function createNumberMask(config: NumberEditingConfig): MaskitoOptions {
  const integerDigits = config.integerDigits ?? 16;
  const maximumMajor = integerDigits >= 16
    ? Number.MAX_SAFE_INTEGER
    : Number("9".repeat(integerDigits));

  return maskitoNumberOptionsGenerator({
    decimalPseudoSeparators: [".", ","].filter(
      (separator) =>
        separator !== config.decimalSeparator
        && separator !== config.groupSeparator
    ),
    decimalSeparator: config.decimalSeparator,
    max: maximumMajor,
    maximumFractionDigits: config.maximumFractionDigits,
    min: config.allowNegative ? -maximumMajor : 0,
    minusSign: "-",
    thousandSeparator: config.groupSeparator
  });
}
