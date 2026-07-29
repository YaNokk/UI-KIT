import type { AmountValue } from "./types";

export function assertAmountValue(value: AmountValue): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError("Amount value must be a safe integer in minor units.");
  }
}

export function fractionDigitsFromMinority(minority: number): number {
  if (!Number.isSafeInteger(minority) || minority < 1) {
    throw new RangeError("Amount minority must be a positive safe integer.");
  }

  const fractionDigits = Math.log10(minority);
  if (!Number.isInteger(fractionDigits)) {
    throw new RangeError("Amount minority must be a power of ten.");
  }

  return fractionDigits;
}

export function minorToDecimalString(
  value: AmountValue,
  minority: number,
  trimTrailingZeros = false
): string {
  assertAmountValue(value);
  const fractionDigits = fractionDigitsFromMinority(minority);
  const sign = value < 0 ? "-" : "";
  const digits = Math.abs(value).toString();

  if (fractionDigits === 0) return `${sign}${digits}`;

  const padded = digits.padStart(fractionDigits + 1, "0");
  const splitAt = padded.length - fractionDigits;
  const major = padded.slice(0, splitAt);
  let minor = padded.slice(splitAt);

  if (trimTrailingZeros) {
    minor = minor.replace(/0+$/, "");
  }

  return minor ? `${sign}${major}.${minor}` : `${sign}${major}`;
}

export function decimalStringToMinor(
  decimal: string,
  minority: number
): AmountValue | null {
  const fractionDigits = fractionDigitsFromMinority(minority);
  const match = /^(-)?(\d*)(?:\.(\d*))?$/.exec(decimal);
  if (!match || (!match[2] && !match[3])) return null;

  const sign = match[1] ? -1 : 1;
  const major = (match[2] || "0").replace(/^0+(?=\d)/, "");
  const suppliedMinor = match[3] ?? "";
  if (suppliedMinor.length > fractionDigits) return null;

  const combined = `${major}${suppliedMinor.padEnd(fractionDigits, "0")}`
    .replace(/^0+(?=\d)/, "");
  const value = sign * Number(combined || "0");

  if (!Number.isSafeInteger(value)) return null;
  return value;
}
