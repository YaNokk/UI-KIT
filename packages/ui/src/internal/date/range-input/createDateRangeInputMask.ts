import type { MaskitoOptions, MaskitoPreprocessor } from "@maskito/core";
import { getLocalizedDatePattern } from "../dateFormatting";
import { localizedDateMask } from "../input-mask/localizedDateMask";

function rangePreprocessor(separator: string): MaskitoPreprocessor {
  return ({ elementState, data }) => ({
    elementState,
    data: data
      .replace(/\s*[–—-]\s*/gu, " — ")
      .replace(/[^\d./,;:\-–—\s]/gu, "")
      .replace(/[./]/g, separator)
  });
}

export function createDateRangeInputMask(locale: string): MaskitoOptions {
  const config = getLocalizedDatePattern(locale);
  const date = localizedDateMask(config);
  return {
    mask: [...date, " ", "—", " ", ...date],
    preprocessors: [rangePreprocessor(config.separator)]
  };
}

export function createDateTimeRangeInputMask(locale: string): MaskitoOptions {
  const config = getLocalizedDatePattern(locale);
  const date = localizedDateMask(config);
  const dateTimeLength = date.length + 7;
  const boundary = (stateValue: string, offset: number) => {
    const firstHour = stateValue[offset + date.length + 2];
    return [
      ...date, ",", " ", /[0-2]/,
      firstHour === "2" ? /[0-3]/ : /\d/,
      ":", /[0-5]/, /\d/
    ];
  };
  return {
    mask: (state) => [
      ...boundary(state.value, 0),
      " ", "—", " ",
      ...boundary(state.value, dateTimeLength + 3)
    ],
    preprocessors: [rangePreprocessor(config.separator)]
  };
}
