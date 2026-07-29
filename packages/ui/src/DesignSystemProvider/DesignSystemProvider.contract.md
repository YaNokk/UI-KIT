# DesignSystemProvider contract

`DesignSystemProvider` is the optional public runtime configuration scope for:

- formatting locale;
- runtime brand;
- light/dark/system mode;
- the shared Portal environment.

Supplied locale/brand/mode values override the nearest parent provider. Omitted
values inherit.
Without a provider, deterministic locale/theme/brand/portal defaults remain
available.

The provider renders a real, layout-neutral `div[data-ds-root]` visual scope
and a boxless internal `div[data-ds-portal-root]`. Each nested provider creates
its own host. Portal resolution is:

```text
portalContainer HTMLElement
→ explicit target

portalContainer undefined
→ this provider's internal host

portalContainer null
→ library default document.body target
```

Component locale props override provider locale. Locale never selects currency,
application country or phone region. Brand and mode produce scoped semantic CSS
variables; components do not consume backend color input directly.

Canonical spacing, typography, radius, component sizes, layers and breakpoint
numbers are not provider configuration. Direction is not exposed until an RTL
component contract exists. Internal locale, theme/brand and portal contexts
remain separate, and no general public configuration hook is exported.

`DesignSystemProvider` is the normal application root. Public `ThemeProvider`
is the advanced/local theme+brand scoping primitive. Locale and the internal
provider portal bridge are not separately exported.
