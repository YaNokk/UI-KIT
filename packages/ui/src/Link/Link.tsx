import {
  forwardRef,
  type AnchorHTMLAttributes,
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

export interface LinkProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "children" | "color" | "href" | "style"
  > {
  appearance?: LinkAppearance;
  children: ReactNode;
  external?: boolean;
  href: string;
  size?: LinkSize;
  tone?: LinkTone;
}

function externalRel(rel: string | undefined, external: boolean): string | undefined {
  if (!external) return rel;
  const values = new Set(rel?.split(/\s+/).filter(Boolean));
  values.add("external");
  return [...values].join(" ");
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    appearance = "inline",
    children,
    className,
    external = false,
    rel,
    size = "md",
    tone = "accent",
    ...nativeProps
  },
  ref
) {
  return (
    <a
      {...nativeProps}
      className={classNames(
        styles.root,
        appearanceClassNames[appearance],
        sizeClassNames[size],
        toneClassNames[tone],
        className
      )}
      data-external={external ? "" : undefined}
      ref={ref}
      rel={externalRel(rel, external)}
    >
      {children}
    </a>
  );
});
