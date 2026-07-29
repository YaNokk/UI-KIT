# DesignSystemProvider contract

`DesignSystemProvider` is the optional public runtime configuration scope for:

- formatting locale;
- runtime brand;
- light/dark/system mode;
- the shared Portal environment.

Supplied values override the nearest parent provider. Omitted values inherit.
Without a provider, deterministic locale/theme/brand/portal defaults remain
available.

Component locale props override provider locale. Locale never selects currency,
application country or phone region. Brand and mode produce scoped semantic CSS
variables; components do not consume backend color input directly.

Canonical spacing, typography, radius, component sizes, layers and breakpoint
numbers are not provider configuration. Direction is not exposed until an RTL
component contract exists. Internal locale, theme/brand and portal contexts
remain separate, and no general public configuration hook is exported.
