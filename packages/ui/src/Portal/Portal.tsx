import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import { createPortal } from "react-dom";

/**
 * `undefined` is an internal pending target. It prevents a provider-owned
 * portal from briefly falling back to body before its host ref is available.
 * `null` remains the library-default target (`document.body` on the client).
 */
const PortalRootContext = createContext<HTMLElement | null | undefined>(null);

export interface PortalProviderProps {
  children: ReactNode;
  root: HTMLElement | null;
}

export function PortalProvider({ children, root }: PortalProviderProps) {
  return (
    <PortalRootContext.Provider value={root}>
      {children}
    </PortalRootContext.Provider>
  );
}

interface PortalScopeProviderProps {
  children: ReactNode;
  root: HTMLElement | null | undefined;
}

/** Internal provider bridge; intentionally not exported from the package. */
export function PortalScopeProvider({
  children,
  root
}: PortalScopeProviderProps) {
  return (
    <PortalRootContext.Provider value={root}>
      {children}
    </PortalRootContext.Provider>
  );
}

export interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null | undefined;
  disabled?: boolean;
}

export function Portal({
  children,
  container,
  disabled = false
}: PortalProps) {
  const configuredRoot = useContext(PortalRootContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) return children;
  if (!mounted) return null;
  if (container === undefined && configuredRoot === undefined) return null;

  const mountNode = container ?? configuredRoot ?? document.body;
  return createPortal(children, mountNode);
}
