import type { MaskitoPreprocessor } from "@maskito/core";
import type { LocalizedDateMaskConfig } from "./maskTypes";

const digit = /\d/;

export function localizedDateMask(config: LocalizedDateMaskConfig) {
  const segmentMasks = {
    day: [digit, digit],
    month: [digit, digit],
    year: [digit, digit, digit, digit]
  } as const;
  return config.order.flatMap((part, index) => [
    ...segmentMasks[part],
    ...(index < config.order.length - 1 ? [config.separator] : [])
  ]);
}

export function localizedSeparatorPreprocessor(
  separator: string
): MaskitoPreprocessor {
  return ({ elementState, data }) => ({
    elementState,
    data: data.replace(/[^\d./-]/g, "").replace(/[./-]/g, separator)
  });
}
