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
