import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode
} from "react";
import { classNames } from "../shared/classNames";
import styles from "./Heading.module.css";

export type HeadingVariant = "sm" | "md" | "lg" | "page";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingTone = "primary" | "secondary" | "inherit";

export interface HeadingProps
  extends Omit<
    HTMLAttributes<HTMLHeadingElement>,
    "children" | "color" | "style"
  > {
  children: ReactNode;
  level: HeadingLevel;
  tone?: HeadingTone;
  variant?: HeadingVariant;
}

const variantClassNames: Record<HeadingVariant, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  page: styles.page
};

const toneClassNames: Record<HeadingTone, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  inherit: styles.inherit
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(
    {
      children,
      className,
      level,
      tone = "primary",
      variant = "md",
      ...nativeProps
    },
    ref
  ) {
    const Component = `h${level}` as const;

    return (
      <Component
        {...nativeProps}
        className={classNames(
          styles.root,
          variantClassNames[variant],
          toneClassNames[tone],
          className
        )}
        ref={ref}
      >
        {children}
      </Component>
    );
  }
);
