import {
  DEFAULT_BRAND_INPUT,
  createBrandCssVariables,
  type BrandInput,
  type ThemeMode
} from "@mypoint/tokens";
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode
} from "react";
import { ResolvedThemeContext } from "./ResolvedThemeContext";

export type ThemePreference = ThemeMode | "system";

export interface ThemeProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  brand?: BrandInput;
  children: ReactNode;
  mode?: ThemePreference;
}

const mediaQuery = "(prefers-color-scheme: dark)";
interface ThemeConfiguration {
  brand: BrandInput;
  mode: ThemePreference;
}

const defaultThemeConfiguration: ThemeConfiguration = {
  brand: DEFAULT_BRAND_INPUT,
  mode: "system"
};
const ThemeConfigurationContext = createContext(defaultThemeConfiguration);

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

function subscribeToNothing(): () => void {
  return () => undefined;
}

function getLightMode(): ThemeMode {
  return "light";
}

function getDarkMode(): ThemeMode {
  return "dark";
}

function useResolvedThemeMode(mode: ThemePreference): ThemeMode {
  const subscribe = mode === "system"
    ? subscribeToSystemMode
    : subscribeToNothing;
  const getSnapshot = mode === "system"
    ? getSystemMode
    : mode === "dark"
      ? getDarkMode
      : getLightMode;
  const getServerSnapshot = mode === "system" ? getServerMode : getSnapshot;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ThemeProvider({
  brand,
  children,
  mode,
  style,
  ...props
}: ThemeProviderProps) {
  const inherited = useContext(ThemeConfigurationContext);
  const configuredBrand = brand ?? inherited.brand;
  const configuredMode = mode ?? inherited.mode;
  const resolvedMode = useResolvedThemeMode(configuredMode);
  const brandVariables = useMemo(
    () => createBrandCssVariables(configuredBrand, resolvedMode),
    [configuredBrand, resolvedMode]
  );
  const configuration = useMemo(
    () => ({ brand: configuredBrand, mode: configuredMode }),
    [configuredBrand, configuredMode]
  );
  const resolvedSnapshot = useMemo(
    () => ({ mode: resolvedMode, variables: brandVariables }),
    [brandVariables, resolvedMode]
  );
  const themeStyle = {
    ...style,
    ...brandVariables
  } as CSSProperties;

  return (
    <ThemeConfigurationContext.Provider value={configuration}>
      <ResolvedThemeContext.Provider value={resolvedSnapshot}>
        <div
          {...props}
          data-brand-theme=""
          data-theme={resolvedMode}
          style={themeStyle}
        >
          {children}
        </div>
      </ResolvedThemeContext.Provider>
    </ThemeConfigurationContext.Provider>
  );
}
