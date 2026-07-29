import type { NumberEditingConfig } from "./types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseNumericInput(
  inputValue: string,
  config: Pick<
    NumberEditingConfig,
    "decimalSeparator" | "groupSeparator" | "postfix" | "prefix"
  >
): string | null {
  let numericValue = inputValue;
  let sign = numericValue.startsWith("-") ? "-" : "";
  if (sign) numericValue = numericValue.slice(1);
  if (config.prefix && numericValue.startsWith(config.prefix)) {
    numericValue = numericValue.slice(config.prefix.length);
  }
  if (!sign && numericValue.startsWith("-")) {
    sign = "-";
    numericValue = numericValue.slice(1);
  }
  if (config.postfix && numericValue.endsWith(config.postfix)) {
    numericValue = numericValue.slice(0, -config.postfix.length);
  }
  numericValue = `${sign}${numericValue}`;

  const normalized = numericValue
    .trim()
    .replace(new RegExp(escapeRegExp(config.groupSeparator), "g"), "")
    .replace(/\s/g, "")
    .replace(config.decimalSeparator, ".");

  if (!normalized || normalized === "-" || normalized === "." || normalized === "-.") {
    return null;
  }
  return /^-?\d*(?:\.\d*)?$/.test(normalized) ? normalized : null;
}
