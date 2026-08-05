import {
  createContext,
  useContext,
  type CSSProperties
} from "react";
import type { ThemeMode } from "@mypoint/tokens";

export interface ResolvedThemeSnapshot {
  mode: ThemeMode;
  variables: CSSProperties;
}

export const ResolvedThemeContext =
  createContext<ResolvedThemeSnapshot | null>(null);

export function useResolvedThemeSnapshot(): ResolvedThemeSnapshot | null {
  return useContext(ResolvedThemeContext);
}
