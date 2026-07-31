import { mediaQueries } from "@mypoint/tokens";
import { useSyncExternalStore } from "react";
import type { SelectPresentation } from "./types";

function subscribeToCompact(onChange: () => void) {
  const query = getCompactQuery();
  if (query === null) return () => {};
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getClientPresentation(): SelectPresentation {
  return getCompactQuery()?.matches ? "sheet" : "popover";
}

function getCompactQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(mediaQueries.belowMd);
}

function getServerPresentation(): SelectPresentation {
  return "popover";
}

export function useSelectPresentation(): SelectPresentation {
  return useSyncExternalStore(
    subscribeToCompact,
    getClientPresentation,
    getServerPresentation
  );
}
