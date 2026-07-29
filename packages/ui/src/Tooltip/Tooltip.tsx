import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode
} from "react";
import type { Placement } from "@floating-ui/react";
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
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import {
  useTooltipPresentation
} from "../internal/floating/useTooltipPresentation";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  children: ReactElement;
  content: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  placement?: TooltipPlacement;
}

function resolveSheetLabels(locale: string) {
  const language = locale.toLowerCase().split("-")[0];
  if (language === "ru") {
    return { close: "Закрыть подсказку", title: "Подсказка" };
  }
  if (language === "kk") {
    return { close: "Кеңесті жабу", title: "Кеңес" };
  }
  return { close: "Close tooltip", title: "Tooltip" };
}

export function Tooltip({
  children,
  content,
  defaultOpen = false,
  onOpenChange,
  open: controlledOpen,
  placement = "top"
}: TooltipProps) {
  const presentation = useTooltipPresentation();
  const locale = useResolvedLocale();
  const labels = resolveSheetLabels(locale);
  const controlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [suppressed, setSuppressed] = useState(false);
  const requestedOpen = controlled ? controlledOpen : uncontrolledOpen;
  const effectiveOpen = requestedOpen && !suppressed;
  const previousPresentation = useRef(presentation);

  const setOpen = useCallback((nextOpen: boolean) => {
    if (!controlled) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [controlled, onOpenChange]);

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
    interaction: "tooltip",
    interactionEnabled: presentation === "floating",
    onOpenChange: setOpen,
    open: presentation === "floating" && effectiveOpen,
    placement: placement as Placement,
    role: "tooltip",
    withArrow: true
  });
  const handleCompactClick = (event: MouseEvent<Element>) => {
    if (
      event.defaultPrevented
      || isDisabledTrigger(children)
      || presentation !== "sheet"
    ) {
      return;
    }
    setOpen(true);
  };
  const trigger = renderFloatingTrigger(
    children,
    floating.getReferenceProps,
    floating.refs.setReference,
    presentation === "sheet" ? { onClick: handleCompactClick } : {}
  );

  return (
    <>
      {trigger}
      {presentation === "floating" && effectiveOpen ? (
        <Portal>
          <FloatingLayerContext.Provider value={floating.childLayer}>
            <div
              {...floating.getFloatingProps()}
              className={styles.tooltip}
              data-floating-overlay=""
              data-placement={floating.placement}
              data-tooltip-surface=""
              ref={floating.refs.setFloating}
              style={{
                ...floating.floatingStyles,
                zIndex: floating.layer
              }}
            >
              {content}
              <span
                aria-hidden="true"
                className={styles.arrow}
                ref={floating.setArrowElement}
                style={floating.arrowStyle}
              />
            </div>
          </FloatingLayerContext.Provider>
        </Portal>
      ) : null}
      {presentation === "sheet" ? (
        <BottomSheet
          closeLabel={labels.close}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setOpen(false);
          }}
          open={effectiveOpen}
          title={labels.title}
        >
          {content}
        </BottomSheet>
      ) : null}
    </>
  );
}
