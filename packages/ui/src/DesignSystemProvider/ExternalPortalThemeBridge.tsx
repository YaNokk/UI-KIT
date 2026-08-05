import { useId, useLayoutEffect, useRef } from "react";
import { useResolvedThemeSnapshot } from "../theme/ResolvedThemeContext";

const externalPortalOwners = new WeakMap<HTMLElement, string>();
const isDevelopment = process.env.NODE_ENV !== "production";
const ownershipWarning =
  "The supplied portalContainer is already owned by another "
  + "DesignSystemProvider. Use a separate portal root for each "
  + "independent provider scope.";

interface ExternalPortalThemeBridgeProps {
  container: HTMLElement | null | undefined;
}

export function ExternalPortalThemeBridge({
  container
}: ExternalPortalThemeBridgeProps) {
  const snapshot = useResolvedThemeSnapshot();
  const providerId = useId();
  const previousNamesRef = useRef<Set<string>>(new Set());

  useLayoutEffect(() => {
    if (!container || !isDevelopment) return;

    const currentOwner = externalPortalOwners.get(container);
    if (currentOwner && currentOwner !== providerId) {
      console.warn(ownershipWarning);
      return;
    }

    externalPortalOwners.set(container, providerId);
    return () => {
      if (externalPortalOwners.get(container) === providerId) {
        externalPortalOwners.delete(container);
      }
    };
  }, [container, providerId]);

  useLayoutEffect(() => {
    if (
      !container
      || !snapshot
      || (isDevelopment && externalPortalOwners.get(container) !== providerId)
    ) {
      return;
    }

    const nextEntries = Object.entries(snapshot.variables);
    const nextNames = new Set(nextEntries.map(([name]) => name));

    for (const name of previousNamesRef.current) {
      if (!nextNames.has(name)) {
        container.style.removeProperty(name);
      }
    }

    container.setAttribute("data-brand-theme", "");
    container.setAttribute("data-theme", snapshot.mode);

    for (const [name, value] of nextEntries) {
      if (value == null) {
        container.style.removeProperty(name);
      } else {
        container.style.setProperty(name, String(value));
      }
    }

    previousNamesRef.current = nextNames;

    return () => {
      container.removeAttribute("data-brand-theme");
      container.removeAttribute("data-theme");

      for (const name of nextNames) {
        container.style.removeProperty(name);
      }

      previousNamesRef.current = new Set();
    };
  }, [container, providerId, snapshot]);

  return null;
}
