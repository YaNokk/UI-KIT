export type AmountValue = number;

export interface AmountFormatConfig {
  currency?: string;
  locale?: string;
  minority?: number;
}

export interface AmountParts {
  currency: string | null;
  currencyPosition: "prefix" | "suffix";
  decimalSeparator: string;
  fractionDigits: number;
  groupSeparator: string;
  major: string;
  minor: string;
  sign: "" | "-" | "+";
  spaceBetweenCurrency: boolean;
}
