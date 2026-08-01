export function isFocusWithinElement(
  element: HTMLElement,
  relatedTarget: EventTarget | null
): boolean {
  if (relatedTarget === null) return false;

  const NodeCtor = element.ownerDocument.defaultView?.Node;
  if (NodeCtor) {
    return relatedTarget instanceof NodeCtor && element.contains(relatedTarget);
  }

  // Detached documents may not have a Window. DOM `contains` remains the
  // authoritative check there, while the guard keeps non-Node targets safe.
  try {
    return element.contains(relatedTarget as Node);
  } catch {
    return false;
  }
}

export function isFocusWithinSelectRegion(
  surface: HTMLElement,
  reference: HTMLElement | null,
  relatedTarget: EventTarget | null
): boolean {
  if (relatedTarget === null) return false;

  const ownerWindow = surface.ownerDocument.defaultView;
  const NodeCtor = ownerWindow?.Node;
  const ElementCtor = ownerWindow?.Element;
  if (NodeCtor && ElementCtor) {
    if (!(relatedTarget instanceof NodeCtor)) return false;
    if (surface.contains(relatedTarget)) return true;
    return reference instanceof ElementCtor && reference.contains(relatedTarget);
  }

  try {
    return surface.contains(relatedTarget as Node)
      || Boolean(reference?.contains(relatedTarget as Node));
  } catch {
    return false;
  }
}
