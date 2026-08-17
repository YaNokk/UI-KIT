interface CapturedStyles {
  bodyInsetBlockStart: string;
  bodyInsetInlineEnd: string;
  bodyInsetInlineStart: string;
  bodyInlineSize: string;
  bodyOverflow: string;
  bodyOverscrollBehavior: string;
  bodyPaddingInlineEnd: string;
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
  const bodyPaddingInlineEnd = view.getComputedStyle(body).paddingInlineEnd;
  const captured: CapturedStyles = {
    bodyInsetBlockStart: body.style.insetBlockStart,
    bodyInsetInlineEnd: body.style.insetInlineEnd,
    bodyInsetInlineStart: body.style.insetInlineStart,
    bodyInlineSize: body.style.inlineSize,
    bodyOverflow: body.style.overflow,
    bodyOverscrollBehavior: body.style.overscrollBehavior,
    bodyPaddingInlineEnd: body.style.paddingInlineEnd,
    bodyPosition: body.style.position,
    documentOverflow: root.style.overflow,
    documentOverflowX: root.style.overflowX,
    documentOverflowY: root.style.overflowY,
    documentOverscrollBehavior: root.style.overscrollBehavior
  };

  /*
   * The document must stop being a scroll owner while a modal branch is open.
   * A classic scrollbar is compensated on the fixed body instead of keeping an
   * active scrollbar on the root; overlay scrollbars need no compensation.
   */
  root.style.overflow = "hidden";
  root.style.overscrollBehavior = "none";
  body.style.position = "fixed";
  body.style.insetBlockStart = `${-scrollY}px`;
  body.style.insetInlineStart = `${-scrollX}px`;
  body.style.insetInlineEnd = "0";
  body.style.inlineSize = "auto";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  if (scrollbarWidth > 0) {
    body.style.paddingInlineEnd = `calc(${bodyPaddingInlineEnd} + ${scrollbarWidth}px)`;
  }
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
      body.style.paddingInlineEnd = captured.bodyPaddingInlineEnd;
      delete root.dataset.dsScrollLocked;
      view.scrollTo(scrollX, scrollY);
    }
  };
}
