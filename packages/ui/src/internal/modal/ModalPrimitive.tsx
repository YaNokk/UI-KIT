import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useContext,
  type CSSProperties,
  type ReactNode
} from "react";
import { Heading } from "../../Heading/Heading";
import { IconButton } from "../../IconButton/IconButton";
import { Portal } from "../../Portal/Portal";
import { Text } from "../../Text/Text";
import { classNames } from "../../shared/classNames";
import {
  ModalLayerContext,
  ModalParentContext,
  useModalEntryView,
  useResolvedModalRuntime
} from "./ModalRuntime";
import type {
  ModalCloseReason,
  ModalKind,
  SharedModalProps
} from "./types";
import { useBottomSheetGesture } from "./useBottomSheetGesture";
import styles from "./ModalPrimitive.module.css";

const focusableSelector = [
  "button:not(:disabled)",
  "[href]",
  "input:not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

type SurfaceKind = ModalKind;

export interface ModalPrimitiveProps extends SharedModalProps {
  dim: boolean;
  dismissOnBackdrop: boolean;
  kind: SurfaceKind;
  surfaceChildren?: ReactNode;
  surfaceStyle?: CSSProperties;
}

const surfaceClassNames: Record<SurfaceKind, string> = {
  dialog: styles.dialog,
  drawer: styles.drawer,
  "bottom-sheet": styles.bottomSheet
};

function isFocusable(element: HTMLElement | null): element is HTMLElement {
  return Boolean(
    element
    && element.isConnected
    && !element.hasAttribute("disabled")
    && element.getAttribute("aria-hidden") !== "true"
  );
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
  const store = useResolvedModalRuntime();
  const view = useModalEntryView(store, id);
  const openRef = useRef(open);
  const callbackRef = useRef(onOpenChange);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const previousOpenRef = useRef(false);
  const pendingReasonRef = useRef<ModalCloseReason | null>(null);

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

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) return;
    const reason = pendingReasonRef.current;
    pendingReasonRef.current = null;
    if (reason) requestClose(reason);
  };

  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
    const explicitTarget = initialFocusRef?.current ?? null;
    if (isFocusable(explicitTarget)) {
      explicitTarget.focus({ preventScroll: true });
      return;
    }

    const firstEligible = contentRef.current?.querySelector<HTMLElement>(
      focusableSelector
    ) ?? null;
    if (isFocusable(firstEligible)) {
      firstEligible.focus({ preventScroll: true });
      return;
    }
    contentRef.current?.focus({ preventScroll: true });
  };

  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    const opener = openerRef.current;
    if (isFocusable(opener)) opener.focus({ preventScroll: true });
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
              onPointerDown={(event) => {
                event.preventDefault();
                if (dismissOnBackdrop) requestClose("backdrop");
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
            onPointerCancel={
              kind === "bottom-sheet"
                ? sheetGesture.onPointerCancel
                : undefined
            }
            onPointerDown={
              kind === "bottom-sheet" ? sheetGesture.onPointerDown : undefined
            }
            onPointerDownOutside={(event) => {
              if (!view.top || !dismissOnBackdrop) {
                event.preventDefault();
                return;
              }
              pendingReasonRef.current = "backdrop";
            }}
            onPointerMove={
              kind === "bottom-sheet" ? sheetGesture.onPointerMove : undefined
            }
            onPointerUp={
              kind === "bottom-sheet" ? sheetGesture.onPointerUp : undefined
            }
            ref={contentRef}
            style={layerStyle}
            tabIndex={-1}
          >
            <ModalParentContext.Provider value={id}>
              <ModalLayerContext.Provider
                value={{
                  floatingLayer: view.floatingLayer,
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
            </ModalParentContext.Provider>
          </DialogPrimitive.Content>
        </div>
      </Portal>
    </DialogPrimitive.Root>
  );
}
