import type { BrandInput } from "@mypoint/tokens";
import {
  useState,
  type HTMLAttributes,
  type ReactNode
} from "react";
import {
  ThemeProvider,
  type ThemePreference
} from "../theme/ThemeProvider";
import { LocaleProvider } from "../internal/locale/LocaleContext";
import { ModalRuntimeProvider } from "../internal/modal/ModalRuntime";
import { PortalScopeProvider } from "../Portal/Portal";
import styles from "./DesignSystemProvider.module.css";

export interface DesignSystemProviderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  brand?: BrandInput;
  children: ReactNode;
  locale?: string;
  mode?: ThemePreference;
  portalContainer?: HTMLElement | null;
}

interface RuntimeScopeProps {
  children: ReactNode;
  locale?: string;
  portalContainer?: HTMLElement | null;
}

function RuntimeScope({
  children,
  locale,
  portalContainer
}: RuntimeScopeProps) {
  const [internalPortalRoot, setInternalPortalRoot] = useState<
    HTMLElement | null | undefined
  >(undefined);
  const portalRoot = portalContainer === undefined
    ? internalPortalRoot
    : portalContainer;

  return (
    <LocaleProvider {...(locale === undefined ? {} : { locale })}>
      <PortalScopeProvider root={portalRoot}>
        <ModalRuntimeProvider>{children}</ModalRuntimeProvider>
        <div
          className={styles.portalRoot}
          data-ds-portal-root=""
          ref={setInternalPortalRoot}
        />
      </PortalScopeProvider>
    </LocaleProvider>
  );
}

export function DesignSystemProvider({
  brand,
  children,
  locale,
  mode,
  portalContainer,
  ...scopeProps
}: DesignSystemProviderProps) {
  return (
    <ThemeProvider
      {...scopeProps}
      {...(brand === undefined ? {} : { brand })}
      {...(mode === undefined ? {} : { mode })}
      data-ds-root=""
    >
      <RuntimeScope
        {...(locale === undefined ? {} : { locale })}
        {...(portalContainer === undefined ? {} : { portalContainer })}
      >
        {children}
      </RuntimeScope>
    </ThemeProvider>
  );
}
