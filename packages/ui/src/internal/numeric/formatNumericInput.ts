import type { NumberEditingConfig } from "./types";

export function formatNumericInput(
  decimal: string,
  config: Pick<
    NumberEditingConfig,
    "decimalSeparator" | "groupSeparator" | "maximumFractionDigits"
  >
): string {
  const negative = decimal.startsWith("-");
  const unsigned = negative ? decimal.slice(1) : decimal;
  const [major = "0", minor] = unsigned.split(".");
  const grouped = major.replace(/\B(?=(\d{3})+(?!\d))/g, config.groupSeparator);
  const fraction = minor == null || config.maximumFractionDigits === 0
    ? ""
    : `${config.decimalSeparator}${minor.slice(0, config.maximumFractionDigits)}`;
  return `${negative ? "-" : ""}${grouped}${fraction}`;
}
