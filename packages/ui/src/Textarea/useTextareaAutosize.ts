import {
  type RefObject,
  useCallback,
  useLayoutEffect
} from "react";

interface TextareaAutosizeOptions {
  enabled: boolean;
  maxRows?: number | undefined;
  minRows: number;
  value: unknown;
}

function readPixelValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useTextareaAutosize(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  { enabled, maxRows, minRows, value }: TextareaAutosizeOptions
) {
  const measure = useCallback(() => {
    const textarea = textareaRef.current;
    if (!enabled || !textarea) return;

    const computed = getComputedStyle(textarea);
    const lineHeight = readPixelValue(computed.lineHeight);
    if (lineHeight <= 0) return;

    const padding = readPixelValue(computed.paddingBlockStart)
      + readPixelValue(computed.paddingBlockEnd);
    const border = readPixelValue(computed.borderBlockStartWidth)
      + readPixelValue(computed.borderBlockEndWidth);
    const minHeight = minRows * lineHeight + padding + border;
    const maxHeight = maxRows == null
      ? Number.POSITIVE_INFINITY
      : maxRows * lineHeight + padding + border;

    textarea.style.height = "auto";
    const contentHeight = Math.max(textarea.scrollHeight + border, minHeight);
    const nextHeight = Math.min(contentHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
  }, [enabled, maxRows, minRows, textareaRef]);

  useLayoutEffect(() => {
    if (!enabled) {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "";
        textarea.style.overflowY = "";
      }
      return;
    }
    measure();
  }, [enabled, measure, value, textareaRef]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!enabled || !textarea || typeof ResizeObserver !== "function") return;

    let previousWidth = textarea.getBoundingClientRect().width;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
        ?? textarea.getBoundingClientRect().width;
      if (width === previousWidth) return;
      previousWidth = width;
      measure();
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [enabled, measure, textareaRef]);

  return measure;
}
