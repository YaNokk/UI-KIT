import type { MaskitoOptions } from "@maskito/core";
import {
  maskitoCaretGuard,
  maskitoNumberOptionsGenerator
} from "@maskito/kit";
import type { NumberEditingConfig } from "./types";

export function createNumberMask(config: NumberEditingConfig): MaskitoOptions {
  const integerDigits = config.integerDigits ?? 16;
  const maximumMajor = integerDigits >= 16
    ? Number.MAX_SAFE_INTEGER
    : Number("9".repeat(integerDigits));

  const options = maskitoNumberOptionsGenerator({
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
    negativePattern: "prefixFirst",
    postfix: config.postfix ?? "",
    prefix: config.prefix ?? "",
    thousandSeparator: config.groupSeparator
  });

  return {
    ...options,
    plugins: [
      ...options.plugins,
      maskitoCaretGuard((value) => {
        const prefixLength = config.prefix?.length ?? 0;
        const postfixStart = config.postfix
          ? value.length - config.postfix.length
          : value.length;
        return [
          Math.min(prefixLength, value.length),
          Math.max(prefixLength, postfixStart)
        ];
      })
    ]
  };
}
