import {
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
  type MutableRefObject,
  type RefObject
} from "react";
import { BottomSheet } from "../../BottomSheet/BottomSheet";
import { Button } from "../../Button/Button";
import { Portal } from "../../Portal/Portal";
import { classNames } from "../../shared/classNames";
import {
  FloatingLayerContext,
  useFloatingOverlay
} from "../floating/useFloatingOverlay";
import { renderFloatingTrigger } from "../floating/trigger";
import { useSelectPresentation } from "./useSelectPresentation";
import type { SelectMessages } from "./types";
import styles from "./SelectPanel.module.css";

export interface SelectPanelProps {
  trigger: ReactElement;
  triggerRef?: RefObject<HTMLElement | null> | undefined;
  focusTriggerRef?: RefObject<HTMLButtonElement | null> | undefined;
  skipFocusRestoreRef?: MutableRefObject<boolean> | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  header?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
  interactive?: boolean | undefined;
  listboxId: string;
  messages: SelectMessages;
  multiple: boolean;
  panelClassName?: string | undefined;
}

export function SelectPanel({
  trigger,
  triggerRef,
  focusTriggerRef,
  skipFocusRestoreRef,
  open,
  onOpenChange,
  children,
  header,
  initialFocusRef,
  interactive = true,
  messages,
  multiple,
  panelClassName
}: SelectPanelProps) {
  const presentation = useSelectPresentation();
  const previousPresentation = useRef(presentation);
  const previousOpen = useRef(open);

  useEffect(() => {
    if (previousOpen.current && !open) {
      if (skipFocusRestoreRef?.current) {
        skipFocusRestoreRef.current = false;
      } else {
        focusTriggerRef?.current?.focus();
      }
    }
    previousOpen.current = open;
  }, [focusTriggerRef, open, skipFocusRestoreRef]);

  // Deterministic presentation switch: close the current presentation, do
  // not auto-reopen, preserve selection (owned by the public component).
  useEffect(() => {
    if (previousPresentation.current === presentation) return;
    previousPresentation.current = presentation;
    if (open) onOpenChange(false);
  }, [presentation, open, onOpenChange]);

  const floating = useFloatingOverlay({
    dismissOnEscape: true,
    dismissOnOutsidePress: true,
    interaction: "click",
    interactionEnabled: presentation === "popover" && interactive,
    matchTriggerWidth: true,
    onOpenChange,
    open: presentation === "popover" && open,
    placement: "bottom-start",
    role: undefined
  });

  const setTriggerNode = (node: HTMLElement | null) => {
    floating.refs.setReference(node);
    if (triggerRef) triggerRef.current = node;
  };

  const renderedTrigger = renderFloatingTrigger(
    trigger,
    floating.getReferenceProps,
    setTriggerNode,
    presentation === "sheet" && interactive
      ? { onClick: () => onOpenChange(!open) }
      : {}
  );

  return (
    <>
      {renderedTrigger}
      {presentation === "popover" && open ? (
        <Portal>
          <FloatingLayerContext.Provider value={floating.childLayer}>
            <div
              {...floating.getFloatingProps()}
              className={classNames(styles.popoverSurface, panelClassName)}
              data-floating-overlay=""
              data-select-surface=""
              ref={floating.refs.setFloating}
              style={{
                ...floating.floatingStyles,
                zIndex: floating.layer
              }}
            >
              {header == null ? null : (
                <div className={styles.header}>{header}</div>
              )}
              {children}
            </div>
          </FloatingLayerContext.Provider>
        </Portal>
      ) : null}
      {presentation === "sheet" ? (
        <BottomSheet
          closeLabel={messages.sheetClose}
          footer={multiple ? (
            <Button
              fullWidth
              onClick={() => onOpenChange(false)}
              variant="primary"
            >
              {messages.done}
            </Button>
          ) : undefined}
          {...(initialFocusRef === undefined ? {} : { initialFocusRef })}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) onOpenChange(false);
          }}
          open={open}
          title={messages.sheetTitle}
        >
          <div className={styles.sheetBody} data-select-surface="">
            {header == null ? null : (
              <div className={styles.header}>{header}</div>
            )}
            {children}
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}
