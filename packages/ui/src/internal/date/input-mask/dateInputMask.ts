import type { MaskitoOptions } from "@maskito/core";
import { getLocalizedDatePattern } from "../dateFormatting";
import { localizedDateMask, localizedSeparatorPreprocessor } from "./localizedDateMask";

export function createDateInputMask(locale: string): MaskitoOptions {
  const config = getLocalizedDatePattern(locale);
  return {
    mask: localizedDateMask(config),
    preprocessors: [localizedSeparatorPreprocessor(config.separator)]
  };
}
