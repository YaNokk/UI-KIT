import { type RefObject, useEffect } from "react";

export function useNativeFormReset(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  enabled: boolean,
  onReset: (value: string) => void,
) {
  useEffect(() => {
    const textarea = textareaRef.current;
    const form = textarea?.form;
    if (!enabled || !textarea || !form) return;

    const handleReset = () => {
      queueMicrotask(() => onReset(textarea.value));
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [enabled, onReset, textareaRef]);
}
