import type { MaskitoOptions, MaskitoPreprocessor } from "@maskito/core";

const sanitizeTime: MaskitoPreprocessor = ({ elementState, data }) => ({
  elementState,
  data: data.replace(/[^\d:]/g, "")
});

export function createTimeInputMask(): MaskitoOptions {
  return {
    mask: (state) => {
      const first = state.value[0];
      return [
        /[0-2]/,
        first === "2" ? /[0-3]/ : /\d/,
        ":",
        /[0-5]/,
        /\d/
      ];
    },
    preprocessors: [sanitizeTime]
  };
}
