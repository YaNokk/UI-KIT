import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode
} from "react";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { Portal } from "../Portal/Portal";
import {
  FloatingLayerContext,
  useFloatingOverlay
} from "../internal/floating/useFloatingOverlay";
import {
  isDisabledTrigger,
  renderFloatingTrigger
} from "../internal/floating/trigger";
import {
  useResponsiveOverlayPresentation
} from "../internal/floating/useResponsiveOverlayPresentation";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import { ActionMenuList } from "./ActionMenuList";
import { resolveActionMenuLabels } from "./labels";
import type { ActionMenuAction } from "./types";
import styles from "./ActionMenu.module.css";

export interface ActionMenuProps {
  actions: readonly ActionMenuAction[];
  closeLabel?: string;
  defaultOpen?: boolean;
  onActionError?: (error: unknown, action: ActionMenuAction) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title?: ReactNode;
  trigger: ReactElement;
}

export function ActionMenu({
  actions,
  closeLabel,
  defaultOpen = false,
  onActionError,
  onOpenChange,
  open: controlledOpen,
  title,
  trigger: triggerElement
}: ActionMenuProps) {
  const presentation = useResponsiveOverlayPresentation();
  const locale = useResolvedLocale();
  const labels = resolveActionMenuLabels(locale);
  const controlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [suppressed, setSuppressed] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const requestedOpen = controlled ? controlledOpen : uncontrolledOpen;
  const effectiveOpen = requestedOpen && !suppressed;
  const pendingRef = useRef(false);
  const previousPresentation = useRef(presentation);
  const previousEffectiveOpen = useRef(effectiveOpen);
  const actionSurfaceRef = useRef<HTMLElement | null>(null);
  const confirming = actions.find((action) => action.id === confirmingId);

  const setOpen = useCallback((nextOpen: boolean) => {
    if (!controlled) setUncontrolledOpen(nextOpen);
    if (!nextOpen) setConfirmingId(null);
    onOpenChange?.(nextOpen);
  }, [controlled, onOpenChange]);

  const setActionSurface = useCallback((surface: HTMLElement | null) => {
    actionSurfaceRef.current = surface;
  }, []);

  useEffect(() => {
    if (!requestedOpen) setSuppressed(false);
  }, [requestedOpen]);

  useEffect(() => {
    if (previousPresentation.current === presentation) return;
    previousPresentation.current = presentation;
    if (!effectiveOpen) return;
    setSuppressed(true);
    setOpen(false);
  }, [effectiveOpen, presentation, setOpen]);

  const floating = useFloatingOverlay({
    dismissOnEscape: true,
    dismissOnOutsidePress: true,
    interaction: "click",
    interactionEnabled: presentation === "floating",
    onOpenChange: setOpen,
    open: presentation === "floating" && effectiveOpen,
    placement: "bottom-end"
  });

  useEffect(() => {
    const wasOpen = previousEffectiveOpen.current;
    previousEffectiveOpen.current = effectiveOpen;
    if (!wasOpen || effectiveOpen) return;
    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLElement
      && activeElement !== document.body
      && !actionSurfaceRef.current?.contains(activeElement)
    ) {
      return;
    }
    const trigger = floating.refs.reference.current;
    if (trigger instanceof HTMLElement && !isDisabledTrigger(triggerElement)) {
      trigger.focus({ preventScroll: true });
    }
  }, [effectiveOpen, floating.refs.reference, triggerElement]);

  const handleCompactClick = (event: MouseEvent<Element>) => {
    if (
      event.defaultPrevented
      || presentation !== "sheet"
      || isDisabledTrigger(triggerElement)
    ) {
      return;
    }
    setOpen(true);
  };

  const trigger = renderFloatingTrigger(
    triggerElement,
    floating.getReferenceProps,
    floating.refs.setReference,
    {
      "aria-expanded": effectiveOpen,
      "aria-haspopup": presentation === "floating" ? "menu" : "dialog",
      ...(presentation === "sheet" ? { onClick: handleCompactClick } : {})
    }
  );

  const run = async (action: ActionMenuAction) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPendingId(action.id);
    try {
      await action.onSelect();
      setOpen(false);
    } catch (error) {
      onActionError?.(error, action);
    } finally {
      pendingRef.current = false;
      setPendingId(null);
    }
  };

  const select = (action: ActionMenuAction) => {
    if (action.tone === "danger" && action.confirmation !== false) {
      setConfirmingId(action.id);
      return;
    }
    void run(action);
  };

  const list = (
    <ActionMenuList
      actions={actions}
      autoFocus={effectiveOpen}
      confirming={confirming}
      menuLabel={typeof title === "string" ? title : labels.title}
      onCancelConfirmation={() => setConfirmingId(null)}
      onConfirm={(action) => void run(action)}
      onRequestClose={() => setOpen(false)}
      onSelect={select}
      pendingId={pendingId}
      presentation={presentation}
      setSurface={setActionSurface}
    />
  );

  return (
    <>
      {trigger}
      {presentation === "floating" && effectiveOpen ? (
        <Portal container={floating.portalContainer}>
          <FloatingLayerContext.Provider value={floating.childLayer}>
            <div
              {...floating.getFloatingProps()}
              className={styles.surface}
              data-action-menu-surface=""
              data-floating-overlay=""
              ref={floating.refs.setFloating}
              style={{
                ...floating.floatingStyles,
                zIndex: floating.layer
              }}
            >
              {list}
            </div>
          </FloatingLayerContext.Provider>
        </Portal>
      ) : null}
      {presentation === "sheet" ? (
        <BottomSheet
          closeLabel={closeLabel ?? labels.close}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setOpen(false);
          }}
          open={effectiveOpen}
          title={title ?? labels.title}
        >
          {list}
        </BottomSheet>
      ) : null}
    </>
  );
}
