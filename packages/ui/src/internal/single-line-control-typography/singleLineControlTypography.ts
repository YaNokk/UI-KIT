import styles from "./singleLineControlTypography.module.css";

export const controlTextClassNames: Record<"sm" | "md" | "lg", string> = {
  sm: styles.controlTextSm,
  md: styles.controlTextMd,
  lg: styles.controlTextLg
};

export const compactControlTextClassNames: Record<"sm" | "md", string> = {
  sm: styles.compactControlTextSm,
  md: styles.compactControlTextMd
};

export const counterTextClassName = styles.counterText;
export const choiceControlLabelClassName = styles.choiceControlLabel;
