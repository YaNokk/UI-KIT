import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode
} from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "soft" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "disabled" | "style" | "color"
  > {
  children: ReactNode;
  variant: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
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

function classNames(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    "aria-busy": ariaBusy,
    "aria-disabled": ariaDisabled,
    children,
    className,
    disabled = false,
    endIcon,
    fullWidth = false,
    loading = false,
    onClick,
    onClickCapture,
    size = "md",
    startIcon,
    type = "button",
    variant,
    ...nativeProps
  },
  ref
) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  };

  const handleClickCapture = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClickCapture?.(event);
  };

  return (
    <button
      {...nativeProps}
      aria-busy={loading ? true : ariaBusy}
      aria-disabled={loading ? true : ariaDisabled}
      className={classNames(
        styles.root,
        variantClassNames[variant],
        sizeClassNames[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className
      )}
      data-loading={loading ? "" : undefined}
      disabled={disabled}
      onClick={handleClick}
      onClickCapture={handleClickCapture}
      ref={ref}
      type={type}
    >
      <span className={styles.content}>
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

      {loading ? (
        <span aria-hidden="true" className={styles.spinner}>
          <svg fill="none" viewBox="0 0 24 24">
            <circle
              className={styles.spinnerTrack}
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M12 3a9 9 0 0 1 9 9"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
        </span>
      ) : null}
    </button>
  );
});
