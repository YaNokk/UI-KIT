import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode
} from "react";
import { classNames } from "../shared/classNames";
import styles from "./Text.module.css";

export type TextVariant =
  | "caption"
  | "bodySm"
  | "body"
  | "bodyStrong"
  | "bodyLg";

export type TextTone =
  | "primary"
  | "secondary"
  | "disabled"
  | "accent"
  | "danger"
  | "success"
  | "warning"
  | "inherit";

export type TextElement = "span" | "p" | "div" | "label";

export interface TextProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "color" | "style"> {
  as?: TextElement;
  children: ReactNode;
  htmlFor?: string;
  tone?: TextTone;
  truncate?: boolean;
  variant?: TextVariant;
}

const variantClassNames: Record<TextVariant, string> = {
  caption: styles.caption,
  bodySm: styles.bodySm,
  body: styles.body,
  bodyStrong: styles.bodyStrong,
  bodyLg: styles.bodyLg
};

const toneClassNames: Record<TextTone, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  disabled: styles.disabled,
  accent: styles.accent,
  danger: styles.danger,
  success: styles.success,
  warning: styles.warning,
  inherit: styles.inherit
};

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Component = "span",
    children,
    className,
    tone = "primary",
    truncate = false,
    variant = "body",
    ...nativeProps
  },
  ref
) {
  return (
    <Component
      {...nativeProps}
      className={classNames(
        styles.root,
        variantClassNames[variant],
        toneClassNames[tone],
        truncate && styles.truncate,
        className
      )}
      ref={ref as never}
    >
      {children}
    </Component>
  );
});
