import type { NumberEditingConfig } from "./types";

const MAX_DECIMAL_PRECISION = 15;

export function validateFractionDigits(
  minimumFractionDigits: number,
  maximumFractionDigits: number,
) {
  if (
    !Number.isInteger(minimumFractionDigits) ||
    minimumFractionDigits < 0 ||
    minimumFractionDigits > MAX_DECIMAL_PRECISION
  ) {
    throw new RangeError(
      `minimumFractionDigits must be an integer between 0 and ${MAX_DECIMAL_PRECISION}.`,
    );
  }

  if (
    !Number.isInteger(maximumFractionDigits) ||
    maximumFractionDigits < minimumFractionDigits ||
    maximumFractionDigits > MAX_DECIMAL_PRECISION
  ) {
    throw new RangeError(
      `maximumFractionDigits must be an integer between minimumFractionDigits and ${MAX_DECIMAL_PRECISION}.`,
    );
  }
}

function expandExponential(value: number) {
  const source = value.toString();

  if (!/[eE]/.test(source)) {
    return source;
  }

  return value
    .toFixed(MAX_DECIMAL_PRECISION)
    .replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
}

export function formatNumberEditingValue(
  value: number | null,
  config: NumberEditingConfig,
  minimumFractionDigits = 0,
) {
  if (value === null) {
    return "";
  }

  if (!Number.isFinite(value)) {
    throw new TypeError("NumberInput value must be a finite number or null.");
  }

  const scale = 10 ** config.maximumFractionDigits;
  const roundedValue = Math.round((value + Number.EPSILON) * scale) / scale;
  const [integerPart = "0", fractionPart = ""] =
    expandExponential(roundedValue).split(".");
  const paddedFraction = fractionPart.padEnd(minimumFractionDigits, "0");
  const decimalValue = paddedFraction
    ? `${integerPart}.${paddedFraction}`
    : integerPart;
  const sign = decimalValue.startsWith("-") ? "-" : "";
  const unsignedValue = sign ? decimalValue.slice(1) : decimalValue;
  const [unsignedInteger = "0", unsignedFraction] = unsignedValue.split(".");
  const groupedInteger = unsignedInteger.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    config.groupSeparator,
  );

  return `${sign}${groupedInteger}${
    unsignedFraction === undefined
      ? ""
      : `${config.decimalSeparator}${unsignedFraction}`
  }`;
}

export function clampNumber(value: number, min?: number, max?: number) {
  return Math.min(
    max ?? Number.POSITIVE_INFINITY,
    Math.max(min ?? Number.NEGATIVE_INFINITY, value),
  );
}
