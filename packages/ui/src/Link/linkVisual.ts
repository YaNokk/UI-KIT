import type { LinkAppearance, LinkSize, LinkTone } from "./types";
import styles from "./Link.module.css";

export const sizeClassNames: Record<LinkSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg
};

export const toneClassNames: Record<LinkTone, string> = {
  accent: styles.accent,
  primary: styles.primary,
  secondary: styles.secondary,
  danger: styles.danger,
  inherit: styles.inherit
};

export const appearanceClassNames: Record<LinkAppearance, string> = {
  inline: styles.inline,
  standalone: styles.standalone
};
