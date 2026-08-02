import {
  useCallback,
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
  type FocusEvent,
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
import { isFocusWithinSelectRegion } from "./focusContainment";
import { useSelectPresentation } from "./useSelectPresentation";
import type { SelectMessages } from "./types";
import styles from "./SelectPanel.module.css";

export interface SelectPanelProps {
  trigger: ReactElement;
  geometryReferenceRef?: RefObject<HTMLElement | null> | undefined;
  triggerRef?: RefObject<HTMLElement | null> | undefined;
  focusTriggerRef?: RefObject<HTMLButtonElement | null> | undefined;
  skipFocusRestoreRef?: MutableRefObject<boolean> | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  outsidePressBoundaryRef?: RefObject<HTMLElement | null> | undefined;
  header?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
  interactive?: boolean | undefined;
  messages: SelectMessages;
  multiple: boolean;
  panelClassName?: string | undefined;
}

export function SelectPanel({
  trigger,
  geometryReferenceRef,
  triggerRef,
  focusTriggerRef,
  skipFocusRestoreRef,
  open,
  onOpenChange,
  children,
  outsidePressBoundaryRef,
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
  const requestedOpen = useRef(open);
  requestedOpen.current = open;
  const popoverFocusOutReady = useRef(false);
  const referenceElementRef = useRef<HTMLElement | null>(null);
  const geometryReferenceRefRef = useRef(geometryReferenceRef);
  geometryReferenceRefRef.current = geometryReferenceRef;
  const virtualReferenceRef = useRef({
    getBoundingClientRect: () => {
      const element = geometryReferenceRefRef.current?.current
        ?? referenceElementRef.current;
      return element?.getBoundingClientRect() ?? new DOMRect();
    },
    get contextElement() {
      return geometryReferenceRefRef.current?.current
        ?? referenceElementRef.current
        ?? undefined;
    }
  });
  const requestOpenChange = useCallback((nextOpen: boolean) => {
    if (requestedOpen.current === nextOpen) return;
    requestedOpen.current = nextOpen;
    onOpenChange(nextOpen);
  }, [onOpenChange]);

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
    if (open) requestOpenChange(false);
  }, [presentation, open, requestOpenChange]);

  useEffect(() => {
    popoverFocusOutReady.current = false;
    if (presentation !== "popover" || !open) return;
    let readyFrame = 0;
    const focusFrame = requestAnimationFrame(() => {
      initialFocusRef?.current?.focus();
      readyFrame = requestAnimationFrame(() => {
        popoverFocusOutReady.current = true;
      });
    });
    return () => {
      cancelAnimationFrame(focusFrame);
      cancelAnimationFrame(readyFrame);
      popoverFocusOutReady.current = false;
    };
  }, [initialFocusRef, open, presentation]);

  const floating = useFloatingOverlay({
    dismissOnEscape: true,
    dismissOnOutsidePress: true,
    outsidePressBoundaryRef,
    interaction: "click",
    interactionEnabled: false,
    matchTriggerWidth: true,
    onOpenChange: requestOpenChange,
    open: presentation === "popover" && open,
    placement: "bottom-start",
    role: undefined
  });

  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    if (node === referenceElementRef.current) return;
    referenceElementRef.current = node;
    if (triggerRef) triggerRef.current = node;

    if (geometryReferenceRef) {
      if (node !== null) {
        floating.refs.setReference(virtualReferenceRef.current);
      }
      return;
    }

    floating.refs.setReference(node);
  }, [floating.refs, geometryReferenceRef, triggerRef]);

  const renderedTrigger = renderFloatingTrigger(
    trigger,
    floating.getReferenceProps,
    setTriggerNode,
    interactive
      ? { onClick: () => requestOpenChange(!open) }
      : {}
  );

  const handlePopoverFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    if (!popoverFocusOutReady.current) return;
    if (
      isFocusWithinSelectRegion(
        event.currentTarget,
        referenceElementRef.current,
        event.relatedTarget
      )
    ) return;
    if (skipFocusRestoreRef) skipFocusRestoreRef.current = true;
    requestOpenChange(false);
  };

  return (
    <>
      {renderedTrigger}
      {presentation === "popover" && open ? (
        <Portal>
          <FloatingLayerContext.Provider value={floating.childLayer}>
            <div
              {...floating.getFloatingProps({ onBlur: handlePopoverFocusOut })}
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
              onClick={() => requestOpenChange(false)}
              variant="primary"
            >
              {messages.done}
            </Button>
          ) : undefined}
          {...(initialFocusRef === undefined ? {} : { initialFocusRef })}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) requestOpenChange(false);
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
