import {
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type Placement
} from "@floating-ui/react";
import { primitiveTokens } from "@mypoint/tokens";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject
} from "react";
import { ModalLayerContext } from "../modal/ModalRuntime";
import type {
  FloatingPlacement,
  FloatingSemanticRole
} from "./types";

type FloatingInteraction = "click" | "tooltip";

export interface UseFloatingOverlayOptions {
  dismissOnEscape: boolean;
  dismissOnOutsidePress: boolean;
  dismissBoundaryRef?: RefObject<HTMLElement | null> | undefined;
  interaction: FloatingInteraction;
  interactionEnabled?: boolean;
  matchTriggerWidth?: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  placement: FloatingPlacement;
  role?: FloatingSemanticRole;
  withArrow?: boolean;
}

const FLOATING_OFFSET = primitiveTokens["space.2"].value;
const FLOATING_VIEWPORT_PADDING = primitiveTokens["space.2"].value;
const TOOLTIP_OPEN_DELAY = 300;
const TOOLTIP_CLOSE_DELAY = 100;
interface FloatingLayerValue {
  depth: number;
  requestedLayer: number;
}

const FloatingLayerContext = createContext<FloatingLayerValue | null>(null);
const activeFloatingOverlays = new WeakMap<Document, symbol[]>();

function isRealmNode(value: unknown, doc: Document): value is Node {
  const view = doc.defaultView;
  return Boolean(view) && value instanceof (view as typeof window).Node;
}

function isRealmElement(value: unknown, doc: Document): value is Element {
  const view = doc.defaultView;
  return Boolean(view) && value instanceof (view as typeof window).Element;
}

export function useFloatingOverlay({
  dismissOnEscape,
  dismissOnOutsidePress,
  dismissBoundaryRef,
  interaction,
  interactionEnabled = true,
  matchTriggerWidth = false,
  onOpenChange,
  open,
  placement,
  role,
  withArrow = false
}: UseFloatingOverlayOptions) {
  const modalLayer = useContext(ModalLayerContext);
  const inheritedLayer = useContext(FloatingLayerContext);
  const overlayToken = useRef(Symbol("floating-overlay"));
  const warnedDepthOverflow = useRef(false);
  const activationEpoch = useRef(0);
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const dismissConfigRef = useRef({ dismissOnEscape, dismissOnOutsidePress });
  const modalSurfaceArbitrationRef = useRef(modalLayer !== null);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
    dismissConfigRef.current = { dismissOnEscape, dismissOnOutsidePress };
    modalSurfaceArbitrationRef.current = modalLayer !== null;
  });

  const requestedLayer = inheritedLayer?.requestedLayer
    ?? modalLayer?.floatingLayer
    ?? primitiveTokens["zIndex.popover"];
  const maximumFloatingLayer = modalLayer
    ? modalLayer.surfaceLayer + 5
    : primitiveTokens["zIndex.modal"] - 1;
  const depth = inheritedLayer?.depth ?? 0;
  const depthOverflow = Boolean(
    modalLayer && requestedLayer > maximumFloatingLayer
  );
  const layer = Math.min(requestedLayer, maximumFloatingLayer);
  const childLayer = {
    depth: depth + 1,
    requestedLayer: requestedLayer + 1
  };

  useEffect(() => {
    if (!open) {
      warnedDepthOverflow.current = false;
      return;
    }
    if (
      !depthOverflow
      || warnedDepthOverflow.current
      || process.env.NODE_ENV === "production"
    ) {
      return;
    }
    warnedDepthOverflow.current = true;
    console.warn(
      "Floating overlay depth exceeded the modal reserved layer range "
        + `for modal ${modalLayer?.modalId ?? "unknown"}. `
        + "The surface was clamped below the next modal guard."
    );
  }, [depthOverflow, modalLayer?.modalId, open]);

  const floating = useFloating({
    middleware: [
      offset(FLOATING_OFFSET),
      flip(),
      shift({ padding: FLOATING_VIEWPORT_PADDING }),
      size({
        padding: FLOATING_VIEWPORT_PADDING,
        apply({ availableHeight, availableWidth, elements, rects }) {
          elements.floating.style.maxBlockSize = `${availableHeight}px`;
          elements.floating.style.maxInlineSize = `${availableWidth}px`;
          elements.floating.style.inlineSize = matchTriggerWidth
            ? `${rects.reference.width}px`
            : "";
        }
      }),
      ...(withArrow && arrowElement
        ? [arrow({ element: arrowElement, padding: FLOATING_VIEWPORT_PADDING })]
        : [])
    ],
    onOpenChange,
    open,
    placement: placement as Placement,
    whileElementsMounted: autoUpdate
  });
  const click = useClick(floating.context, {
    enabled: interactionEnabled && interaction === "click"
  });
  const hover = useHover(floating.context, {
    delay: {
      close: TOOLTIP_CLOSE_DELAY,
      open: TOOLTIP_OPEN_DELAY
    },
    enabled: interactionEnabled && interaction === "tooltip",
    move: false
  });
  const focus = useFocus(floating.context, {
    enabled: interactionEnabled && interaction === "tooltip"
  });
  const semantics = useRole(floating.context, {
    enabled: interactionEnabled && role !== undefined,
    role: role ?? "dialog"
  });
  const interactions = useInteractions([
    click,
    hover,
    focus,
    semantics
  ]);

  const referenceElement = floating.refs.reference.current;
  const floatingElement = floating.refs.floating.current;
  const ownerDocument = referenceElement && "ownerDocument" in referenceElement
    ? referenceElement.ownerDocument
    : floatingElement?.ownerDocument ?? document;

  useEffect(() => {
    activationEpoch.current += 1;
    const epoch = activationEpoch.current;
    if (!open) return;
    const token = overlayToken.current;
    let stack = activeFloatingOverlays.get(ownerDocument);
    if (!stack) {
      stack = [];
      activeFloatingOverlays.set(ownerDocument, stack);
    }
    const registeredStack = stack;
    const existingIndex = registeredStack.lastIndexOf(token);
    if (existingIndex >= 0) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "Floating overlay activation stack already contained this overlay "
            + "token; removing the stale entry before registration."
        );
      }
      registeredStack.splice(existingIndex, 1);
    }
    registeredStack.push(token);
    const isTopmost = () => registeredStack.at(-1) === token;
    const isCurrentActivation = () => activationEpoch.current === epoch;
    const handleEscape = (event: KeyboardEvent) => {
      if (
        !isCurrentActivation()
        || !dismissConfigRef.current.dismissOnEscape
        || event.key !== "Escape"
        || !isTopmost()
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      onOpenChangeRef.current(false);
    };
    const handleOutsidePress = (event: PointerEvent) => {
      if (
        !isCurrentActivation()
        || !dismissConfigRef.current.dismissOnOutsidePress
        || !isTopmost()
      ) {
        return;
      }
      const target = event.target;
      if (!isRealmNode(target, ownerDocument)) return;
      const currentReference = floating.refs.reference.current;
      if (
        (isRealmElement(currentReference, ownerDocument)
          && currentReference.contains(target))
        || dismissBoundaryRef?.current?.contains(target)
        || floating.refs.floating.current?.contains(target)
      ) {
        return;
      }
      const targetElement = isRealmElement(target, ownerDocument)
        ? target
        : target.parentElement;
      const targetModalSurface = targetElement?.closest(
        "[data-modal-surface]"
      );
      const parentModalSurface = isRealmElement(currentReference, ownerDocument)
        ? currentReference.closest("[data-modal-surface]")
        : null;
      if (
        targetModalSurface
        && targetModalSurface !== parentModalSurface
      ) {
        return;
      }
      const mustConsume = Boolean(
        modalSurfaceArbitrationRef.current
        && (
          targetElement?.closest("[data-modal-guard]")
          || targetModalSurface !== parentModalSurface
        )
      );
      if (mustConsume) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
      onOpenChangeRef.current(false);
    };
    const ownerWindow = ownerDocument.defaultView;
    if (ownerWindow) {
      ownerWindow.addEventListener("keydown", handleEscape, true);
      ownerWindow.addEventListener("pointerdown", handleOutsidePress, true);
      return () => {
        ownerWindow.removeEventListener("keydown", handleEscape, true);
        ownerWindow.removeEventListener("pointerdown", handleOutsidePress, true);
        const index = registeredStack.lastIndexOf(token);
        if (index >= 0) registeredStack.splice(index, 1);
      };
    }
    ownerDocument.addEventListener("keydown", handleEscape, true);
    ownerDocument.addEventListener("pointerdown", handleOutsidePress, true);
    return () => {
      ownerDocument.removeEventListener("keydown", handleEscape, true);
      ownerDocument.removeEventListener("pointerdown", handleOutsidePress, true);
      const index = registeredStack.lastIndexOf(token);
      if (index >= 0) registeredStack.splice(index, 1);
    };
    // Only logical activation and document ownership re-register the overlay.
    // Dismiss configuration and callbacks are read through latest-value refs.
  }, [dismissBoundaryRef, open, ownerDocument]);

  const arrowStyle = useMemo(
    () => ({
      left: floating.middlewareData.arrow?.x,
      top: floating.middlewareData.arrow?.y
    }),
    [floating.middlewareData.arrow?.x, floating.middlewareData.arrow?.y]
  );

  return {
    arrowStyle,
    childLayer,
    context: floating.context,
    floatingStyles: floating.floatingStyles,
    getFloatingProps: interactions.getFloatingProps,
    getReferenceProps: interactions.getReferenceProps,
    layer,
    placement: floating.placement,
    refs: floating.refs,
    setArrowElement
  };
}

export { FloatingLayerContext };
