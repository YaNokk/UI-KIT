import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode
} from "react";
import { Heading } from "../../Heading/Heading";
import { IconButton } from "../../IconButton/IconButton";
import { Portal } from "../../Portal/Portal";
import { Text } from "../../Text/Text";
import { classNames } from "../../shared/classNames";
import {
  ModalFocusReturnContext,
  ModalLayerContext,
  ModalParentContext,
  useModalEntryView,
  useResolvedModalRuntime
} from "./ModalRuntime";
import type {
  ModalBaseProps,
  ModalCloseReason
} from "../../modal/types";
import type { ModalKind } from "./types";
import { useBottomSheetGesture } from "./useBottomSheetGesture";
import styles from "./ModalPrimitive.module.css";

const BACKDROP_DRAG_TOLERANCE = 8;

type SurfaceKind = ModalKind;

export interface ModalPrimitiveProps extends ModalBaseProps {
  dim: boolean;
  dismissOnBackdrop: boolean;
  kind: SurfaceKind;
  surfaceChildren?: ReactNode;
  surfaceStyle?: CSSProperties;
}

interface GuardPointerSequence {
  guard: HTMLDivElement;
  pointerId: number;
  startX: number;
  startY: number;
}

const surfaceClassNames: Record<SurfaceKind, string> = {
  dialog: styles.dialog,
  drawer: styles.drawer,
  "bottom-sheet": styles.bottomSheet
};

function isValidFocusTarget(
  element: HTMLElement | null
): element is HTMLElement {
  if (
    !element
    || !element.isConnected
    || element.hasAttribute("disabled")
    || element.closest("[inert], [hidden], [aria-hidden='true']")
  ) {
    return false;
  }

  if ("checkVisibility" in element) {
    return element.checkVisibility({
      checkOpacity: false,
      checkVisibilityCSS: true
    });
  }

  return true;
}

export function ModalPrimitive({
  children,
  className,
  closeLabel,
  description,
  dim,
  dismissOnBackdrop,
  dismissOnEscape = true,
  footer,
  headerActions,
  initialFocusRef,
  kind,
  onOpenChange,
  open,
  surfaceChildren,
  surfaceStyle,
  title
}: ModalPrimitiveProps) {
  const id = useId();
  const parentId = useContext(ModalParentContext);
  const parentFocusReturn = useContext(ModalFocusReturnContext);
  const store = useResolvedModalRuntime();
  const view = useModalEntryView(store, id);
  const openRef = useRef(open);
  const callbackRef = useRef(onOpenChange);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const previousOpenRef = useRef(false);
  const pendingReasonRef = useRef<ModalCloseReason | null>(null);
  const guardPointerRef = useRef<GuardPointerSequence | null>(null);

  openRef.current = open;
  callbackRef.current = onOpenChange;
  const requestClose = (reason: ModalCloseReason) => {
    store?.requestClose(id, reason);
  };
  const sheetGesture = useBottomSheetGesture({
    enabled: kind === "bottom-sheet" && view.top,
    onDismiss: () => requestClose("swipe")
  });

  useLayoutEffect(() => {
    if (open && !previousOpenRef.current) {
      const activeElement = document.activeElement;
      openerRef.current = activeElement instanceof HTMLElement
        ? activeElement
        : null;
    }
    previousOpenRef.current = open;
  }, [open]);

  const registration = useMemo(
    () => (
      typeof document === "undefined"
        ? null
        : {
            id,
            parentId,
            kind,
            open,
            dim,
            dismissOnBackdrop,
            dismissOnEscape,
            ownerDocument: document,
            getRequestedOpen: () => openRef.current,
            onOpenChange: (
              nextOpen: boolean,
              meta: { reason: ModalCloseReason }
            ) => callbackRef.current(nextOpen, meta)
          }
    ),
    [
      dim,
      dismissOnBackdrop,
      dismissOnEscape,
      id,
      kind,
      open,
      parentId
    ]
  );

  useEffect(() => {
    if (!store || !registration) return;
    return store.register(registration);
    // Registration lifetime follows the runtime and logical modal identity.
  }, [id, parentId, store]);

  useEffect(() => {
    if (store && registration) store.update(id, registration);
  }, [id, registration, store]);

  useEffect(() => {
    guardPointerRef.current = null;
  }, [open, view.top]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) return;
    const reason = pendingReasonRef.current;
    pendingReasonRef.current = null;
    if (reason) requestClose(reason);
  };

  const handleOpenAutoFocus = (event: Event) => {
    const explicitTarget = initialFocusRef?.current ?? null;
    if (isValidFocusTarget(explicitTarget)) {
      event.preventDefault();
      explicitTarget.focus({ preventScroll: true });
    }
  };

  const handleCloseAutoFocus = (event: Event) => {
    const opener = openerRef.current;
    const fallback = isValidFocusTarget(opener)
      ? opener
      : parentFocusReturn?.getFallbackTarget() ?? null;
    if (!isValidFocusTarget(fallback)) return;
    event.preventDefault();
    fallback.focus({ preventScroll: true });
  };

  if (!store || !view.registered || !view.active) return null;

  const layerStyle = {
    ...(kind === "bottom-sheet" ? sheetGesture.style : {}),
    ...surfaceStyle,
    zIndex: view.surfaceLayer
  };

  return (
    <DialogPrimitive.Root open={view.active} onOpenChange={handleOpenChange}>
      <Portal>
        <div className={styles.portal}>
          {view.top ? (
            <div
              aria-hidden="true"
              className={styles.guard}
              data-dim={dim ? "" : undefined}
              data-modal-guard=""
              onLostPointerCapture={() => {
                guardPointerRef.current = null;
              }}
              onPointerCancel={() => {
                guardPointerRef.current = null;
              }}
              onPointerDown={(event) => {
                if (!event.isPrimary) return;
                event.preventDefault();
                guardPointerRef.current = {
                  guard: event.currentTarget,
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY
                };
              }}
              onPointerMove={(event) => {
                const sequence = guardPointerRef.current;
                if (!sequence || sequence.pointerId !== event.pointerId) return;
                const distance = Math.hypot(
                  event.clientX - sequence.startX,
                  event.clientY - sequence.startY
                );
                if (distance > BACKDROP_DRAG_TOLERANCE) {
                  guardPointerRef.current = null;
                }
              }}
              onPointerUp={(event) => {
                const sequence = guardPointerRef.current;
                guardPointerRef.current = null;
                if (
                  !sequence
                  || sequence.pointerId !== event.pointerId
                  || sequence.guard !== event.currentTarget
                  || !dismissOnBackdrop
                ) {
                  return;
                }
                requestClose("backdrop");
              }}
              style={{ zIndex: view.guardLayer }}
            />
          ) : null}

          <DialogPrimitive.Content
            aria-modal="true"
            className={classNames(
              styles.surface,
              surfaceClassNames[kind],
              className
            )}
            data-modal-kind={kind}
            data-modal-surface=""
            data-motion-ready=""
            onCloseAutoFocus={handleCloseAutoFocus}
            onEscapeKeyDown={(event) => {
              if (!view.top || !dismissOnEscape) {
                event.preventDefault();
                return;
              }
              pendingReasonRef.current = "escape";
            }}
            onOpenAutoFocus={handleOpenAutoFocus}
            onLostPointerCapture={(event) => {
              guardPointerRef.current = null;
              if (kind === "bottom-sheet") {
                sheetGesture.onLostPointerCapture(event);
              }
            }}
            onPointerCancel={(event) => {
              guardPointerRef.current = null;
              if (kind === "bottom-sheet") {
                sheetGesture.onPointerCancel(event);
              }
            }}
            onPointerDown={(event) => {
              guardPointerRef.current = null;
              if (kind === "bottom-sheet") {
                sheetGesture.onPointerDown(event);
              }
            }}
            onPointerDownOutside={(event) => {
              event.preventDefault();
            }}
            onPointerMove={(event) => {
              guardPointerRef.current = null;
              if (kind === "bottom-sheet") {
                sheetGesture.onPointerMove(event);
              }
            }}
            onPointerUp={(event) => {
              guardPointerRef.current = null;
              if (kind === "bottom-sheet") {
                sheetGesture.onPointerUp(event);
              }
            }}
            ref={contentRef}
            style={layerStyle}
            tabIndex={-1}
          >
            <ModalParentContext.Provider value={id}>
              <ModalFocusReturnContext.Provider
                value={{
                  getFallbackTarget: () => {
                    if (isValidFocusTarget(contentRef.current)) {
                      return contentRef.current;
                    }
                    if (isValidFocusTarget(openerRef.current)) {
                      return openerRef.current;
                    }
                    return parentFocusReturn?.getFallbackTarget() ?? null;
                  }
                }}
              >
                <ModalLayerContext.Provider
                  value={{
                    floatingLayer: view.floatingLayer,
                    modalId: id,
                    surfaceLayer: view.surfaceLayer
                  }}
                >
                  {kind === "bottom-sheet" ? (
                    <div aria-hidden="true" className={styles.dragHandle} />
                  ) : null}

                  <header className={styles.header}>
                    <div className={styles.heading}>
                      <DialogPrimitive.Title asChild>
                        <Heading level={2} variant="md">
                          {title}
                        </Heading>
                      </DialogPrimitive.Title>
                      {description != null ? (
                        <DialogPrimitive.Description asChild>
                          <Text as="p" tone="secondary" variant="bodySm">
                            {description}
                          </Text>
                        </DialogPrimitive.Description>
                      ) : null}
                    </div>

                    <div className={styles.actions}>
                      {headerActions}
                      <IconButton
                        aria-label={closeLabel}
                        icon={<X />}
                        onClick={() => requestClose("close-button")}
                        size="sm"
                        variant="ghost"
                      />
                    </div>
                  </header>

                  <div className={styles.body} data-modal-scroll-container="">
                    {children}
                    {surfaceChildren}
                  </div>

                  {footer != null ? (
                    <footer className={styles.footer}>{footer}</footer>
                  ) : null}
                </ModalLayerContext.Provider>
              </ModalFocusReturnContext.Provider>
            </ModalParentContext.Provider>
          </DialogPrimitive.Content>
        </div>
      </Portal>
    </DialogPrimitive.Root>
  );
}
