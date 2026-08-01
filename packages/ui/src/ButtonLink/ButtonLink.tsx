import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode
} from "react";
import {
  ButtonVisualContent,
  buttonVisualClassName,
  type ButtonVisualProps
} from "../Button/buttonVisual";

export interface ButtonLinkProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "children" | "color" | "href" | "style"
  >,
    ButtonVisualProps {
  children: ReactNode;
  href: string;
}

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    {
      children,
      className,
      endIcon,
      fullWidth = false,
      size = "md",
      startIcon,
      variant,
      ...nativeProps
    },
    ref
  ) {
    return (
      <a
        {...nativeProps}
        className={buttonVisualClassName({
          className,
          fullWidth,
          size,
          variant
        })}
        ref={ref}
      >
        <ButtonVisualContent endIcon={endIcon} size={size} startIcon={startIcon}>
          {children}
        </ButtonVisualContent>
      </a>
    );
  }
);
