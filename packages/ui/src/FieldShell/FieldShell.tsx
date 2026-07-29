import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode
} from "react";
import { classNames } from "../shared/classNames";
import type { FieldLabelView, FieldSize } from "../shared/field";
import styles from "./FieldShell.module.css";

export type { FieldLabelView, FieldSize };

export interface FieldShellProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "color" | "style"> {
  children: ReactNode;
  disabled?: boolean;
  endAdornment?: ReactNode;
  invalid?: boolean;
  label?: ReactNode;
  labelFloated?: boolean;
  labelView?: FieldLabelView;
  onFocusRequest?: () => void;
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
      label,
      labelFloated = false,
      labelView = "outer",
      onClick,
      onFocusRequest,
      readOnly = false,
      size = "md",
      startAdornment,
      ...nativeProps
    },
    ref
  ) {
    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled || !onFocusRequest) return;

      const target = event.target;
      if (
        target instanceof Element
        && target.closest(
          "[data-field-interactive],button,a,input,select,textarea,"
          + "[contenteditable=\"true\"],[tabindex]:not([tabindex=\"-1\"])"
        )
      ) {
        return;
      }

      onFocusRequest();
    };

    return (
      <div
        {...nativeProps}
        className={classNames(
          styles.root,
          sizeClassNames[size],
          disabled && styles.disabled,
          readOnly && styles.readOnly,
          invalid && styles.invalid,
          labelView === "inner" && styles.inner,
          labelFloated && styles.floated,
          className
        )}
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        data-label-floated={labelFloated ? "" : undefined}
        data-label-view={labelView}
        data-readonly={readOnly ? "" : undefined}
        onClick={handleClick}
        ref={ref}
      >
        {startAdornment == null ? null : (
          <span className={styles.adornment} data-position="start">
            {startAdornment}
          </span>
        )}
        <span className={styles.content}>
          {label == null ? null : (
            <span className={styles.innerLabel}>{label}</span>
          )}
          <span className={styles.control}>{children}</span>
        </span>
        {endAdornment == null ? null : (
          <span className={styles.adornment} data-position="end">
            {endAdornment}
          </span>
        )}
      </div>
    );
  }
);
