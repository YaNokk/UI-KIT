import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import { createPortal } from "react-dom";

const PortalRootContext = createContext<HTMLElement | null>(null);

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

export interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
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

  const mountNode = container ?? configuredRoot ?? document.body;
  return createPortal(children, mountNode);
}
