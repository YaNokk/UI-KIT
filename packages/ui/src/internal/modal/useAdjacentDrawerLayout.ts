import { mediaQueries } from "@mypoint/tokens";
import { useSyncExternalStore } from "react";

function getQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(mediaQueries.xlUp);
}

function subscribe(onChange: () => void) {
  const query = getQuery();
  if (query === null) return () => undefined;
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getClientSnapshot() {
  return getQuery()?.matches ?? false;
}

function getServerSnapshot() {
  return false;
}

export function useAdjacentDrawerLayout() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
