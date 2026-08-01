import type { HTMLAttributes } from "react";
import { getSystemColorClass, type SystemColor } from "../internal/system-color/systemColor";
import { classNames } from "../shared/classNames";
import styles from "./StatusIndicator.module.css";

export type StatusIndicatorSize = "sm" | "md";

export interface StatusIndicatorProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "color" | "style"> {
  color?: SystemColor;
  label?: string;
  size?: StatusIndicatorSize;
}

const sizeClassNames: Record<StatusIndicatorSize, string> = {
  sm: styles.sm,
  md: styles.md
};

export function StatusIndicator({
  className,
  color = "gray",
  label,
  size = "sm",
  ...nativeProps
}: StatusIndicatorProps) {
  const isLabeled = Boolean(label);

  return (
    <span
      {...nativeProps}
      aria-hidden={isLabeled ? undefined : true}
      aria-label={isLabeled ? label : undefined}
      className={classNames(
        styles.root,
        sizeClassNames[size],
        getSystemColorClass(color),
        className
      )}
      data-status-indicator=""
      role={isLabeled ? "img" : undefined}
    />
  );
}
