import { suppressOthers } from "aria-hidden";
import { tabbable } from "tabbable";

interface DrawerModalBoundaryOptions {
  surfaces: HTMLElement[];
}

function uniqueElements(elements: Element[]) {
  return [...new Set(elements)];
}

function contains(roots: HTMLElement[], target: EventTarget | null) {
  return target instanceof Node && roots.some((root) => root.contains(target));
}

function focusableTargets(roots: HTMLElement[]) {
  return roots.flatMap((root) => tabbable(root));
}

export function activateDrawerModalBoundary({
  surfaces
}: DrawerModalBoundaryOptions) {
  const preferredSurface = surfaces.at(-1);
  if (!preferredSurface) return () => undefined;
  const ownerDocument = preferredSurface.ownerDocument;
  const roots = surfaces;
  const portalRoots = uniqueElements(roots.map((surface) => (
    surface.closest("[data-modal-portal]") ?? surface
  )));
  const liveRegions = Array.from(ownerDocument.querySelectorAll("[aria-live]"));
  const restoreIsolation = suppressOthers(
    uniqueElements([...portalRoots, ...liveRegions]),
    ownerDocument.body,
    "data-ds-drawer-workspace-suppressed"
  );
  let lastFocused = contains(roots, ownerDocument.activeElement)
    ? ownerDocument.activeElement as HTMLElement
    : preferredSurface;

  const restoreFocus = () => {
    const target = lastFocused.isConnected ? lastFocused : preferredSurface;
    target.focus({ preventScroll: true });
  };

  const handleFocusIn = (event: FocusEvent) => {
    if (contains(roots, event.target)) {
      lastFocused = event.target as HTMLElement;
      return;
    }
    restoreFocus();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const targets = focusableTargets(roots);
    if (targets.length === 0) {
      event.preventDefault();
      preferredSurface.focus({ preventScroll: true });
      return;
    }

    const activeIndex = targets.indexOf(ownerDocument.activeElement as HTMLElement);
    const shouldWrapBackward = event.shiftKey && activeIndex <= 0;
    const shouldWrapForward = !event.shiftKey && (
      activeIndex === -1 || activeIndex === targets.length - 1
    );
    if (!shouldWrapBackward && !shouldWrapForward) return;

    event.preventDefault();
    const target = shouldWrapBackward ? targets.at(-1) : targets[0];
    target?.focus({ preventScroll: true });
  };

  ownerDocument.addEventListener("focusin", handleFocusIn, true);
  ownerDocument.addEventListener("keydown", handleKeyDown, true);

  return () => {
    ownerDocument.removeEventListener("focusin", handleFocusIn, true);
    ownerDocument.removeEventListener("keydown", handleKeyDown, true);
    restoreIsolation();
  };
}
