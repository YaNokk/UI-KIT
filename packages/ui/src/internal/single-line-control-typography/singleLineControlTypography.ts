import styles from "./singleLineControlTypography.module.css";

export const controlTextClassNames: Record<"sm" | "md" | "lg", string> = {
  sm: styles.controlTextSm,
  md: styles.controlTextMd,
  lg: styles.controlTextLg
};

export const fieldValueTypographyClassNames: Record<"sm" | "md" | "lg", string> = {
  sm: styles.fieldValueTypographySm,
  md: styles.fieldValueTypographyMd,
  lg: styles.fieldValueTypographyLg
};

export const fieldValueOpticalClassNames: Record<"sm" | "md" | "lg", string> = {
  sm: styles.fieldValueOpticalSm,
  md: styles.fieldValueOpticalMd,
  lg: styles.fieldValueOpticalLg
};

export const compactChipTextClassName = styles.compactChipText;

export const compactControlTextClassNames: Record<"sm" | "md", string> = {
  sm: styles.compactControlTextSm,
  md: styles.compactControlTextMd
};

export const counterTextClassName = styles.counterText;
export const choiceControlLabelClassName = styles.choiceControlLabel;
