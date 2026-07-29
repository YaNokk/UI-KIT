const verticalScrollValues = new Set(["auto", "scroll", "overlay"]);

export function findNearestVerticalScrollOwner(
  target: EventTarget | null,
  boundary: HTMLElement
): HTMLElement | null {
  const view = boundary.ownerDocument.defaultView;
  const HTMLElementCtor = view?.HTMLElement;
  let current =
    HTMLElementCtor && target instanceof HTMLElementCtor
      ? (target as HTMLElement)
      : null;

  while (current && current !== boundary) {
    const overflowY = view?.getComputedStyle(current).overflowY ?? "";
    if (
      verticalScrollValues.has(overflowY)
      && current.scrollHeight > current.clientHeight
    ) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}
