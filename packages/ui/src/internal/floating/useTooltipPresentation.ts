import { mediaQueries } from "@mypoint/tokens";
import { useSyncExternalStore } from "react";

export type TooltipPresentation = "floating" | "sheet";

function subscribeToCompact(onChange: () => void) {
  const query = window.matchMedia(mediaQueries.belowMd);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getClientPresentation(): TooltipPresentation {
  return window.matchMedia(mediaQueries.belowMd).matches
    ? "sheet"
    : "floating";
}

function getServerPresentation(): TooltipPresentation {
  return "floating";
}

export function useTooltipPresentation(): TooltipPresentation {
  return useSyncExternalStore(
    subscribeToCompact,
    getClientPresentation,
    getServerPresentation
  );
}
