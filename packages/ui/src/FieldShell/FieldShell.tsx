import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode
} from "react";
import { classNames } from "../shared/classNames";
import type { FieldSize } from "../shared/field";
import styles from "./FieldShell.module.css";

export type { FieldSize };

export interface FieldShellProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "color" | "style"> {
  children: ReactNode;
  disabled?: boolean;
  endAdornment?: ReactNode;
  invalid?: boolean;
  readOnly?: boolean;
  size?: FieldSize;
  startAdornment?: ReactNode;
}

const sizeClassNames: Record<FieldSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg
};

export const FieldShell = forwardRef<HTMLDivElement, FieldShellProps>(
  function FieldShell(
    {
      children,
      className,
      disabled = false,
      endAdornment,
      invalid = false,
      readOnly = false,
      size = "md",
      startAdornment,
      ...nativeProps
    },
    ref
  ) {
    return (
      <div
        {...nativeProps}
        className={classNames(
          styles.root,
          sizeClassNames[size],
          disabled && styles.disabled,
          readOnly && styles.readOnly,
          invalid && styles.invalid,
          className
        )}
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        ref={ref}
      >
        {startAdornment == null ? null : (
          <span className={styles.adornment} data-position="start">
            {startAdornment}
          </span>
        )}
        <span className={styles.content}>{children}</span>
        {endAdornment == null ? null : (
          <span className={styles.adornment} data-position="end">
            {endAdornment}
          </span>
        )}
      </div>
    );
  }
);
