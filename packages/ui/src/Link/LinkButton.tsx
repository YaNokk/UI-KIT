import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode
} from "react";
import { classNames } from "../shared/classNames";
import {
  appearanceClassNames,
  sizeClassNames,
  toneClassNames
} from "./linkVisual";
import type { LinkAppearance, LinkSize, LinkTone } from "./types";
import styles from "./Link.module.css";

export interface LinkButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "color" | "style"
  > {
  appearance?: LinkAppearance;
  children: ReactNode;
  size?: LinkSize;
  tone?: LinkTone;
}

export const LinkButton = forwardRef<HTMLButtonElement, LinkButtonProps>(
  function LinkButton(
    {
      appearance = "inline",
      children,
      className,
      size = "md",
      tone = "accent",
      type = "button",
      ...nativeProps
    },
    ref
  ) {
    return (
      <button
        {...nativeProps}
        className={classNames(
          styles.root,
          styles.button,
          appearanceClassNames[appearance],
          sizeClassNames[size],
          toneClassNames[tone],
          className
        )}
        ref={ref}
        type={type}
      >
        {children}
      </button>
    );
  }
);
