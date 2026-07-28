import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode
} from "react";
import {
  ButtonVisualContent,
  buttonVisualClassName,
  type ButtonVisualProps
} from "./buttonVisual";
import { classNames } from "../shared/classNames";
import styles from "./Button.module.css";

export type { ButtonSize, ButtonVariant } from "./buttonVisual";

export interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "disabled" | "style" | "color"
  >,
    ButtonVisualProps {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
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
        buttonVisualClassName({ className, fullWidth, size, variant }),
        styles.root,
        loading && styles.loading
      )}
      data-loading={loading ? "" : undefined}
      disabled={disabled}
      onClick={handleClick}
      onClickCapture={handleClickCapture}
      ref={ref}
      type={type}
    >
      <ButtonVisualContent
        className={loading ? styles.loadingContent : undefined}
        endIcon={endIcon}
        startIcon={startIcon}
      >
        {children}
      </ButtonVisualContent>

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
