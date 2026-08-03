import type { MaskitoOptions } from "@maskito/core";
import { getLocalizedDatePattern } from "../dateFormatting";
import { localizedDateMask, localizedSeparatorPreprocessor } from "./localizedDateMask";

export function createDateTimeInputMask(locale: string): MaskitoOptions {
  const config = getLocalizedDatePattern(locale);
  const dateMask = localizedDateMask(config);
  return {
    mask: (state) => {
      const timeStart = dateMask.length + 2;
      const firstHour = state.value[timeStart];
      return [
        ...dateMask,
        ",",
        " ",
        /[0-2]/,
        firstHour === "2" ? /[0-3]/ : /\d/,
        ":",
        /[0-5]/,
        /\d/
      ];
    },
    preprocessors: [localizedSeparatorPreprocessor(config.separator)]
  };
}
