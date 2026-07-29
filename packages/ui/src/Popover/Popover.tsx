import {
  type ReactElement,
  type ReactNode
} from "react";
import type { Placement } from "@floating-ui/react";
import { Portal } from "../Portal/Portal";
import { classNames } from "../shared/classNames";
import {
  FloatingLayerContext,
  useFloatingOverlay
} from "../internal/floating/useFloatingOverlay";
import { renderFloatingTrigger } from "../internal/floating/trigger";
import styles from "./Popover.module.css";

export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

export interface PopoverProps {
  children: ReactNode;
  className?: string;
  dismissOnEscape?: boolean;
  dismissOnOutsidePress?: boolean;
  matchTriggerWidth?: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  placement?: PopoverPlacement;
  trigger: ReactElement;
}

export function Popover({
  children,
  className,
  dismissOnEscape = true,
  dismissOnOutsidePress = true,
  matchTriggerWidth = false,
  onOpenChange,
  open,
  placement = "bottom-start",
  trigger
}: PopoverProps) {
  const floating = useFloatingOverlay({
    dismissOnEscape,
    dismissOnOutsidePress,
    interaction: "click",
    matchTriggerWidth,
    onOpenChange,
    open,
    placement: placement as Placement,
    role: "dialog"
  });

  return (
    <>
      {renderFloatingTrigger(
        trigger,
        floating.getReferenceProps,
        floating.refs.setReference
      )}
      {open ? (
        <Portal>
          <FloatingLayerContext.Provider value={floating.childLayer}>
            <div
              {...floating.getFloatingProps()}
              className={classNames(styles.surface, className)}
              data-floating-overlay=""
              data-popover-surface=""
              ref={floating.refs.setFloating}
              style={{
                ...floating.floatingStyles,
                zIndex: floating.layer
              }}
            >
              {children}
            </div>
          </FloatingLayerContext.Provider>
        </Portal>
      ) : null}
    </>
  );
}
