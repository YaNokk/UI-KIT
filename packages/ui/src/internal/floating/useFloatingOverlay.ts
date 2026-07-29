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
  useState
} from "react";
import { ModalLayerContext } from "../modal/ModalRuntime";

type FloatingInteraction = "click" | "tooltip";
type FloatingRole = "dialog" | "tooltip";

export interface UseFloatingOverlayOptions {
  dismissOnEscape: boolean;
  dismissOnOutsidePress: boolean;
  interaction: FloatingInteraction;
  interactionEnabled?: boolean;
  matchTriggerWidth?: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  placement: Placement;
  role: FloatingRole;
  withArrow?: boolean;
}

const FLOATING_OFFSET = primitiveTokens["space.2"].value;
const FLOATING_VIEWPORT_PADDING = primitiveTokens["space.2"].value;
const TOOLTIP_OPEN_DELAY = 300;
const TOOLTIP_CLOSE_DELAY = 100;
const FloatingLayerContext = createContext<number | null>(null);
const activeFloatingOverlays = new WeakMap<Document, symbol[]>();

export function useFloatingOverlay({
  dismissOnEscape,
  dismissOnOutsidePress,
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
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
  const layer = inheritedLayer
    ?? modalLayer?.floatingLayer
    ?? primitiveTokens["zIndex.popover"];
  const maximumChildLayer = modalLayer
    ? modalLayer.surfaceLayer + 5
    : primitiveTokens["zIndex.modal"] - 1;
  const childLayer = Math.min(layer + 1, maximumChildLayer);

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
    placement,
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
    enabled: interactionEnabled,
    role
  });
  const interactions = useInteractions([
    click,
    hover,
    focus,
    semantics
  ]);

  useEffect(() => {
    if (!open || (!dismissOnEscape && !dismissOnOutsidePress)) return;
    const reference = floating.refs.reference.current;
    const ownerDocument = reference && "ownerDocument" in reference
      ? reference.ownerDocument
      : floating.refs.floating.current?.ownerDocument ?? document;
    const token = overlayToken.current;
    const stack = activeFloatingOverlays.get(ownerDocument) ?? [];
    if (!activeFloatingOverlays.has(ownerDocument)) {
      activeFloatingOverlays.set(ownerDocument, stack);
    }
    stack.push(token);
    const isTopmost = () => stack.at(-1) === token;
    const handleEscape = (event: KeyboardEvent) => {
      if (
        !dismissOnEscape
        || event.key !== "Escape"
        || !isTopmost()
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      onOpenChange(false);
    };
    const handleOutsidePress = (event: PointerEvent) => {
      if (!dismissOnOutsidePress || !isTopmost()) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      const referenceElement = floating.refs.reference.current;
      if (
        (referenceElement instanceof Element && referenceElement.contains(target))
        || floating.refs.floating.current?.contains(target)
      ) {
        return;
      }
      if (modalLayer) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
      onOpenChange(false);
    };
    const ownerWindow = ownerDocument.defaultView;
    if (ownerWindow) {
      ownerWindow.addEventListener("keydown", handleEscape, true);
      ownerWindow.addEventListener("pointerdown", handleOutsidePress, true);
      return () => {
        ownerWindow.removeEventListener("keydown", handleEscape, true);
        ownerWindow.removeEventListener("pointerdown", handleOutsidePress, true);
        const index = stack.lastIndexOf(token);
        if (index >= 0) stack.splice(index, 1);
      };
    }
    ownerDocument.addEventListener("keydown", handleEscape, true);
    ownerDocument.addEventListener("pointerdown", handleOutsidePress, true);
    return () => {
      ownerDocument.removeEventListener("keydown", handleEscape, true);
      ownerDocument.removeEventListener("pointerdown", handleOutsidePress, true);
      const index = stack.lastIndexOf(token);
      if (index >= 0) stack.splice(index, 1);
    };
  }, [
    dismissOnEscape,
    dismissOnOutsidePress,
    floating.refs.floating,
    floating.refs.reference,
    modalLayer,
    onOpenChange,
    open
  ]);

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
