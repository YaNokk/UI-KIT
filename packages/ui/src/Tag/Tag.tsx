import { X } from "lucide-react";
import type { ReactNode } from "react";
import { getSystemColorClass, type SystemColor } from "../internal/system-color/systemColor";
import { classNames } from "../shared/classNames";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";
import { compactControlTextClassNames } from "../internal/single-line-control-typography/singleLineControlTypography";
import styles from "./Tag.module.css";

export type TagSize = "sm" | "md";

interface TagBaseProps {
  children: ReactNode;
  className?: string;
  color?: SystemColor;
  dot?: boolean;
  size?: TagSize;
}

export interface StaticTagProps extends TagBaseProps {
  onClick?: never;
  onRemove?: never;
  removeLabel?: never;
  selected?: never;
}

export interface SelectableTagProps extends TagBaseProps {
  disabled?: boolean;
  onClick(): void;
  onRemove?: never;
  removeLabel?: never;
  selected: boolean;
}

export interface RemovableTagProps extends TagBaseProps {
  disabled?: boolean;
  onClick?: never;
  onRemove(): void;
  removeLabel: string;
  selected?: never;
}

export type TagProps = StaticTagProps | SelectableTagProps | RemovableTagProps;

const sizeClassNames: Record<TagSize, string> = {
  sm: styles.sm,
  md: styles.md
};

export function Tag(props: TagProps) {
  const {
    children,
    className,
    color = "gray",
    dot = false,
    size = "md"
  } = props;
  const disabled = "disabled" in props ? props.disabled ?? false : false;
  const isRemovable = "onRemove" in props && typeof props.onRemove === "function";
  const isSelectable = !isRemovable
    && "selected" in props
    && typeof props.selected === "boolean";
  const selected = isSelectable ? props.selected : false;
  const rootClassName = classNames(
    styles.root,
    sizeClassNames[size],
    getSystemColorClass(color),
    selected && styles.selected,
    className
  );
  const content = (
    <>
      {dot ? <StatusIndicator color={color} size="sm" /> : null}
      <span className={styles.labelClip} data-control-text-clip="">
        <span
          className={classNames(styles.label, compactControlTextClassNames[size])}
          data-compact-control-text=""
        >{children}</span>
      </span>
      {isRemovable ? (
        <span aria-hidden="true" className={styles.removeIcon}>
          <X />
        </span>
      ) : null}
    </>
  );

  if (isRemovable) {
    return (
      <button
        aria-label={props.removeLabel}
        className={rootClassName}
        disabled={disabled}
        onClick={props.onRemove}
        type="button"
      >
        {content}
      </button>
    );
  }

  if (isSelectable) {
    return (
      <button
        aria-pressed={selected}
        className={rootClassName}
        disabled={disabled}
        onClick={props.onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <span className={rootClassName}>{content}</span>;
}
