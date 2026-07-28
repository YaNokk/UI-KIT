import {
  DEFAULT_BRAND_INPUT,
  createBrandCssVariables,
  type BrandInput,
  type ThemeMode
} from "@mypoint/tokens";
import {
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode
} from "react";

export type ThemePreference = ThemeMode | "system";

export interface ThemeProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  brand?: BrandInput;
  children: ReactNode;
  mode?: ThemePreference;
}

const mediaQuery = "(prefers-color-scheme: dark)";

function subscribeToSystemMode(onChange: () => void): () => void {
  const query = window.matchMedia(mediaQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSystemMode(): ThemeMode {
  return window.matchMedia(mediaQuery).matches ? "dark" : "light";
}

function getServerMode(): ThemeMode {
  return "light";
}

export function ThemeProvider({
  brand = DEFAULT_BRAND_INPUT,
  children,
  mode = "system",
  style,
  ...props
}: ThemeProviderProps) {
  const systemMode = useSyncExternalStore(
    subscribeToSystemMode,
    getSystemMode,
    getServerMode
  );
  const resolvedMode = mode === "system" ? systemMode : mode;
  const brandVariables = useMemo(
    () => createBrandCssVariables(brand, resolvedMode),
    [brand, resolvedMode]
  );
  const themeStyle = {
    ...style,
    ...brandVariables
  } as CSSProperties;

  return (
    <div
      {...props}
      data-brand-theme=""
      data-theme={resolvedMode}
      style={themeStyle}
    >
      {children}
    </div>
  );
}
