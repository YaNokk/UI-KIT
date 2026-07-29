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
  const systemMode = useSyncExternalStore(
    subscribeToSystemMode,
    getSystemMode,
    getServerMode
  );
  const resolvedMode = configuredMode === "system" ? systemMode : configuredMode;
  const brandVariables = useMemo(
    () => createBrandCssVariables(configuredBrand, resolvedMode),
    [configuredBrand, resolvedMode]
  );
  const configuration = useMemo(
    () => ({ brand: configuredBrand, mode: configuredMode }),
    [configuredBrand, configuredMode]
  );
  const themeStyle = {
    ...style,
    ...brandVariables
  } as CSSProperties;

  return (
    <ThemeConfigurationContext.Provider value={configuration}>
      <div
        {...props}
        data-brand-theme=""
        data-theme={resolvedMode}
        style={themeStyle}
      >
        {children}
      </div>
    </ThemeConfigurationContext.Provider>
  );
}
