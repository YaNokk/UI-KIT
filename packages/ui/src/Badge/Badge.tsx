import type { HTMLAttributes } from "react";
import { getSystemColorClass, type SystemColor } from "../internal/system-color/systemColor";
import { classNames } from "../shared/classNames";
import { counterTextClassName } from "../internal/single-line-control-typography/singleLineControlTypography";
import styles from "./Badge.module.css";

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "color" | "style"> {
  children: number | string;
  color?: SystemColor;
  label?: string;
  max?: number;
}

function formatBadgeValue(value: number | string, max: number | undefined) {
  if (typeof value !== "number" || max === undefined) return value;

  if (!Number.isFinite(max) || max < 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Badge] max must be a finite non-negative number; ignoring it.");
    }
    return value;
  }

  return value > max ? `${max}+` : value;
}

export function Badge({
  children,
  className,
  color = "gray",
  label,
  max,
  ...nativeProps
}: BadgeProps) {
  const value = formatBadgeValue(children, max);

  return (
    <span
      {...nativeProps}
      aria-label={label}
      className={classNames(
        styles.root,
        getSystemColorClass(color),
        className
      )}
      data-badge=""
    >
      <span className={styles.labelClip} data-control-text-clip="">
        <span
          className={classNames(styles.label, counterTextClassName)}
          data-control-text-role="counterText"
          data-counter-text=""
        >{value}</span>
      </span>
    </span>
  );
}
