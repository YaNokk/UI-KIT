import {
  createContext,
  type ReactNode,
  useContext
} from "react";
import { DEFAULT_LOCALE, resolveLocale } from "./resolveLocale";

const LocaleContext = createContext(DEFAULT_LOCALE);

export interface LocaleProviderProps {
  children: ReactNode;
  locale?: string;
}

export function LocaleProvider({ children, locale }: LocaleProviderProps) {
  const inheritedLocale = useContext(LocaleContext);
  const configuredLocale = resolveLocale(locale, inheritedLocale);

  return (
    <LocaleContext.Provider value={configuredLocale}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useResolvedLocale(explicitLocale?: string): string {
  return resolveLocale(explicitLocale, useContext(LocaleContext));
}
