import type { MaskitoOptions } from "@maskito/core";

export interface LocalizedDateMaskConfig {
  separator: string;
  order: readonly ("day" | "month" | "year")[];
}

export type DateInputMask = MaskitoOptions;
