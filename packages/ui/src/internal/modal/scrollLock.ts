interface CapturedStyles {
  bodyInsetBlockStart: string;
  bodyInsetInlineEnd: string;
  bodyInsetInlineStart: string;
  bodyInlineSize: string;
  bodyOverflow: string;
  bodyOverscrollBehavior: string;
  bodyPosition: string;
  documentOverflow: string;
  documentOverflowX: string;
  documentOverflowY: string;
  documentOverscrollBehavior: string;
}

export interface DocumentScrollLock {
  release(): void;
}

export function acquireDocumentScrollLock(
  ownerDocument: Document
): DocumentScrollLock {
  const view = ownerDocument.defaultView;
  const root = ownerDocument.documentElement;
  const body = ownerDocument.body;

  if (!view || !body) return { release: () => undefined };

  const scrollX = view.scrollX;
  const scrollY = view.scrollY;
  const scrollbarWidth = Math.max(0, view.innerWidth - root.clientWidth);
  const captured: CapturedStyles = {
    bodyInsetBlockStart: body.style.insetBlockStart,
    bodyInsetInlineEnd: body.style.insetInlineEnd,
    bodyInsetInlineStart: body.style.insetInlineStart,
    bodyInlineSize: body.style.inlineSize,
    bodyOverflow: body.style.overflow,
    bodyOverscrollBehavior: body.style.overscrollBehavior,
    bodyPosition: body.style.position,
    documentOverflow: root.style.overflow,
    documentOverflowX: root.style.overflowX,
    documentOverflowY: root.style.overflowY,
    documentOverscrollBehavior: root.style.overscrollBehavior
  };

  /*
   * Fixing the body prevents document movement without padding compensation.
   * If a classic scrollbar already occupied layout space, `overflow-y: scroll`
   * keeps exactly that gutter. Overlay/mobile scrollbars keep no gutter.
   */
  root.style.overflowX = "hidden";
  root.style.overflowY = scrollbarWidth > 0 ? "scroll" : "hidden";
  root.style.overscrollBehavior = "none";
  body.style.position = "fixed";
  body.style.insetBlockStart = `${-scrollY}px`;
  body.style.insetInlineStart = `${-scrollX}px`;
  body.style.insetInlineEnd = "0";
  body.style.inlineSize = "auto";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  root.dataset.dsScrollLocked = "";

  let released = false;
  return {
    release() {
      if (released) return;
      released = true;

      root.style.overflow = captured.documentOverflow;
      root.style.overflowX = captured.documentOverflowX;
      root.style.overflowY = captured.documentOverflowY;
      root.style.overscrollBehavior = captured.documentOverscrollBehavior;
      body.style.position = captured.bodyPosition;
      body.style.insetBlockStart = captured.bodyInsetBlockStart;
      body.style.insetInlineStart = captured.bodyInsetInlineStart;
      body.style.insetInlineEnd = captured.bodyInsetInlineEnd;
      body.style.inlineSize = captured.bodyInlineSize;
      body.style.overflow = captured.bodyOverflow;
      body.style.overscrollBehavior = captured.bodyOverscrollBehavior;
      delete root.dataset.dsScrollLocked;
      view.scrollTo(scrollX, scrollY);
    }
  };
}
