import type { ReactNode } from "react";
import { classNames } from "../shared/classNames";
import styles from "./buttonVisual.module.css";

export type ButtonVariant = "primary" | "secondary" | "soft" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonVisualProps {
  endIcon?: ReactNode;
  fullWidth?: boolean;
  size?: ButtonSize;
  startIcon?: ReactNode;
  variant: ButtonVariant;
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  soft: styles.soft,
  danger: styles.danger
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg
};

interface ButtonVisualClassNameOptions {
  className?: string | undefined;
  fullWidth?: boolean;
  size?: ButtonSize;
  variant: ButtonVariant;
}

export function buttonVisualClassName({
  className,
  fullWidth = false,
  size = "md",
  variant
}: ButtonVisualClassNameOptions): string {
  return classNames(
    styles.root,
    variantClassNames[variant],
    sizeClassNames[size],
    fullWidth && styles.fullWidth,
    className
  );
}

interface ButtonVisualContentProps {
  children: ReactNode;
  className?: string | undefined;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
}

export function ButtonVisualContent({
  children,
  className,
  endIcon,
  startIcon
}: ButtonVisualContentProps) {
  return (
    <span className={classNames(styles.content, className)}>
      {startIcon !== undefined && startIcon !== null ? (
        <span aria-hidden="true" className={styles.icon}>
          {startIcon}
        </span>
      ) : null}

      <span className={styles.label}>{children}</span>

      {endIcon !== undefined && endIcon !== null ? (
        <span aria-hidden="true" className={styles.icon}>
          {endIcon}
        </span>
      ) : null}
    </span>
  );
}
