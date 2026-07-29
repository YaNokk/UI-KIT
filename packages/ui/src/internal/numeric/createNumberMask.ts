import type { MaskitoOptions, MaskitoPlugin } from "@maskito/core";
import {
  maskitoCaretGuard,
  maskitoNumberOptionsGenerator
} from "@maskito/kit";
import type { NumberEditingConfig } from "./types";

function editableRange(
  value: string,
  config: NumberEditingConfig
): [number, number] {
  const from = Math.min(config.prefix?.length ?? 0, value.length);
  const to = Math.max(
    from,
    config.postfix ? value.length - config.postfix.length : value.length
  );
  return [from, to];
}

function selectEditableSegmentPlugin(
  config: NumberEditingConfig
): MaskitoPlugin {
  return (element) => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.altKey
        || (!event.ctrlKey && !event.metaKey)
        || event.key.toLowerCase() !== "a"
      ) {
        return;
      }

      event.preventDefault();
      const [from, to] = editableRange(element.value, config);
      element.setSelectionRange(from, to);
    };

    element.addEventListener("keydown", onKeyDown);
    return () => element.removeEventListener("keydown", onKeyDown);
  };
}

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
      selectEditableSegmentPlugin(config),
      maskitoCaretGuard((value) => {
        return editableRange(value, config);
      })
    ]
  };
}
