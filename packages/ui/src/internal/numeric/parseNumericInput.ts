import type { NumberEditingConfig } from "./types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseNumericInput(
  inputValue: string,
  config: Pick<NumberEditingConfig, "decimalSeparator" | "groupSeparator">
): string | null {
  const normalized = inputValue
    .trim()
    .replace(new RegExp(escapeRegExp(config.groupSeparator), "g"), "")
    .replace(/\s/g, "")
    .replace(config.decimalSeparator, ".");

  if (!normalized || normalized === "-" || normalized === "." || normalized === "-.") {
    return null;
  }
  return /^-?\d*(?:\.\d*)?$/.test(normalized) ? normalized : null;
}
