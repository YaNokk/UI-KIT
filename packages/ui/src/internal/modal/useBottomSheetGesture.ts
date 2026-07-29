import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEventHandler
} from "react";

const DISMISS_VELOCITY = 0.4;
const DISMISS_DISTANCE_RATIO = 0.2;

interface GestureState {
  active: boolean;
  cancelled: boolean;
  pointerId: number;
  startTime: number;
  startX: number;
  startY: number;
}

interface BottomSheetGestureOptions {
  enabled: boolean;
  onDismiss: () => void;
}

interface BottomSheetGestureResult {
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  style: CSSProperties;
}

const idleGesture: GestureState = {
  active: false,
  cancelled: false,
  pointerId: -1,
  startTime: 0,
  startX: 0,
  startY: 0
};

export function useBottomSheetGesture({
  enabled,
  onDismiss
}: BottomSheetGestureOptions): BottomSheetGestureResult {
  const gestureRef = useRef<GestureState>(idleGesture);
  const [offset, setOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const sync = () => setViewportHeight(viewport.height);
    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
    };
  }, []);

  const reset = () => {
    gestureRef.current = idleGesture;
    setOffset(0);
  };

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (
      !enabled
      || !event.isPrimary
      || (event.pointerType !== "touch" && event.pointerType !== "pen")
    ) {
      return;
    }

    const target = event.target instanceof HTMLElement ? event.target : null;
    const scrollOwner = target?.closest<HTMLElement>(
      "[data-modal-scroll-container]"
    );
    if (scrollOwner && scrollOwner.scrollTop > 0) return;

    gestureRef.current = {
      active: true,
      cancelled: false,
      pointerId: event.pointerId,
      startTime: performance.now(),
      startX: event.clientX,
      startY: event.clientY
    };
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    const gesture = gestureRef.current;
    if (!gesture.active || gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (Math.abs(deltaX) > Math.abs(deltaY) || deltaY <= 0) {
      gesture.cancelled = true;
      setOffset(0);
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    setOffset(deltaY);
  };

  const onPointerUp: PointerEventHandler<HTMLDivElement> = (event) => {
    const gesture = gestureRef.current;
    if (!gesture.active || gesture.pointerId !== event.pointerId) return;

    const distance = Math.max(0, event.clientY - gesture.startY);
    const duration = Math.max(1, performance.now() - gesture.startTime);
    const velocity = distance / duration;
    const distanceThreshold =
      event.currentTarget.getBoundingClientRect().height
      * DISMISS_DISTANCE_RATIO;
    const shouldDismiss = !gesture.cancelled
      && (velocity >= DISMISS_VELOCITY || distance >= distanceThreshold);

    reset();
    if (shouldDismiss) onDismiss();
  };

  return {
    onPointerCancel: reset,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    style: {
      "--modal-sheet-offset": `${offset}px`,
      ...(viewportHeight === null
        ? {}
        : { "--modal-visual-viewport-height": `${viewportHeight}px` })
    } as CSSProperties
  };
}
