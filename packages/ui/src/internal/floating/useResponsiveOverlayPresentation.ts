import { mediaQueries } from "@mypoint/tokens";
import { useSyncExternalStore } from "react";

export type ResponsiveOverlayPresentation = "floating" | "sheet";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(mediaQueries.belowMd);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getClientSnapshot(): ResponsiveOverlayPresentation {
  return window.matchMedia(mediaQueries.belowMd).matches
    ? "sheet"
    : "floating";
}

function getServerSnapshot(): ResponsiveOverlayPresentation {
  return "floating";
}

export function useResponsiveOverlayPresentation(): ResponsiveOverlayPresentation {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
