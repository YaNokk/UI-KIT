import {
  forwardRef,
  type HTMLAttributes
} from "react";
import { classNames } from "../shared/classNames";
import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerTone =
  | "current"
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "inverse";

export interface SpinnerProps
  extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    "children" | "color" | "style"
  > {
  label?: string;
  size?: SpinnerSize;
  tone?: SpinnerTone;
}

const sizeClassNames: Record<SpinnerSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg
};

const toneClassNames: Record<SpinnerTone, string> = {
  current: styles.current,
  primary: styles.primary,
  secondary: styles.secondary,
  accent: styles.accent,
  danger: styles.danger,
  inverse: styles.inverse
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    {
      className,
      label,
      size = "md",
      tone = "current",
      ...nativeProps
    },
    ref
  ) {
    const isLabeled = Boolean(label);

    return (
      <span
        {...nativeProps}
        aria-hidden={isLabeled ? undefined : true}
        aria-live={isLabeled ? "polite" : undefined}
        className={classNames(
          styles.root,
          sizeClassNames[size],
          toneClassNames[tone],
          className
        )}
        data-spinner=""
        ref={ref}
        role={isLabeled ? "status" : undefined}
      >
        <svg
          aria-hidden="true"
          className={styles.graphic}
          focusable="false"
          viewBox="0 0 24 24"
        >
          <circle className={styles.track} cx="12" cy="12" r="9" />
          <path className={styles.indicator} d="M12 3a9 9 0 0 1 9 9" />
        </svg>
        {isLabeled ? <span className={styles.srOnly}>{label}</span> : null}
      </span>
    );
  }
);
