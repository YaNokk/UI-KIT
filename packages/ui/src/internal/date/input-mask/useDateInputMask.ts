import { Maskito, type MaskitoOptions } from "@maskito/core";
import { useEffect, useState, type RefCallback } from "react";

export function useDateInputMask(options: MaskitoOptions): RefCallback<HTMLInputElement> {
  const [element, setElement] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!element) return;
    const mask = new Maskito(element, options);
    return () => mask.destroy();
  }, [element, options]);
  return setElement;
}
