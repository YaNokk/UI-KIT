import type { BrandInput } from "@mypoint/tokens";
import type { HTMLAttributes, ReactNode } from "react";
import {
  ThemeProvider,
  type ThemePreference
} from "../theme/ThemeProvider";
import { LocaleProvider } from "../internal/locale/LocaleContext";
import { PortalProvider } from "../Portal/Portal";

export interface DesignSystemProviderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  brand?: BrandInput;
  children: ReactNode;
  locale?: string;
  mode?: ThemePreference;
  portalContainer?: HTMLElement | null;
}

export function DesignSystemProvider({
  brand,
  children,
  locale,
  mode,
  portalContainer,
  ...scopeProps
}: DesignSystemProviderProps) {
  const content = portalContainer === undefined
    ? children
    : <PortalProvider root={portalContainer}>{children}</PortalProvider>;

  return (
    <ThemeProvider
      {...scopeProps}
      {...(brand === undefined ? {} : { brand })}
      {...(mode === undefined ? {} : { mode })}
    >
      <LocaleProvider {...(locale === undefined ? {} : { locale })}>
        {content}
      </LocaleProvider>
    </ThemeProvider>
  );
}
