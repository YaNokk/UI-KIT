import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode
} from "react";
import { classNames } from "../shared/classNames";
import styles from "./IconButton.module.css";

export type IconButtonVariant =
  | "primary"
  | "secondary"
  | "soft"
  | "ghost"
  | "danger";

export type IconButtonSize = "sm" | "md" | "lg";

type IconButtonAccessibleName =
  | {
      "aria-label": string;
      "aria-labelledby"?: string;
    }
  | {
      "aria-label"?: never;
      "aria-labelledby": string;
    };

type IconButtonNativeProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "color"
  | "disabled"
  | "style"
>;

export type IconButtonProps = IconButtonNativeProps &
  IconButtonAccessibleName & {
    disabled?: boolean;
    icon: ReactNode;
    loading?: boolean;
    size?: IconButtonSize;
    variant?: IconButtonVariant;
  };

const variantClassNames: Record<IconButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  soft: styles.soft,
  ghost: styles.ghost,
  danger: styles.danger
};

const sizeClassNames: Record<IconButtonSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      "aria-busy": ariaBusy,
      "aria-disabled": ariaDisabled,
      className,
      disabled = false,
      icon,
      loading = false,
      onClick,
      onClickCapture,
      size = "md",
      type = "button",
      variant = "ghost",
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
        <span
          aria-hidden="true"
          className={classNames(styles.icon, loading && styles.loadingIcon)}
        >
          {icon}
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
  }
);
