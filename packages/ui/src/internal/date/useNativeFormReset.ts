import { useEffect, type RefObject } from "react";

export function useNativeFormReset(
  ref: RefObject<HTMLInputElement | null>,
  onReset: () => void
) {
  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const handleReset = () => queueMicrotask(onReset);
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [onReset, ref]);
}
