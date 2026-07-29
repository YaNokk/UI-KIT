# DesignSystemProvider

`DesignSystemProvider` is the optional application root for design-system
runtime configuration. Components remain usable without it.

```tsx
<DesignSystemProvider
  brand={{ accentColor: "#7c3aed", foregroundColor: "#ffffff" }}
  locale="ru-RU"
  mode="system"
>
  <App />
</DesignSystemProvider>
```

## Runtime API

- `locale` configures formatting. A component's explicit locale wins.
- `mode` accepts `light`, `dark` or `system`. Only `system` subscribes to the
  operating-system preference; explicit modes perform no `matchMedia` work.
- `brand` uses the canonical `BrandInput` contract. The resolver writes scoped
  semantic CSS variables; components do not read backend colors in React.
- `portalContainer` overrides the provider-owned portal host. See the exact
  resolution contract below.
- ordinary `div` attributes apply to the provider's visual scope.

Direction is not exposed in v1 because the component system does not yet have a
verified RTL contract.

## Defaults and nesting

Without a provider, locale falls back deterministically to `en-US`, theme mode
uses the existing `system` preference with a light SSR snapshot, brand uses the
canonical default input, and portals mount to `document.body` after hydration.

Nested providers override supplied locale/brand/mode values and inherit omitted
values. Every nested provider owns a new portal host by default so its overlays
remain inside its nearest visual scope.

```text
component locale
→ nearest DesignSystemProvider locale
→ en-US
```

Locale remains independent from currency, application country and future phone
region.

## Ownership boundaries

The provider owns runtime environment only. Spacing, radius, typography,
control sizes, layers and breakpoint numbers remain canonical tokens and
component contracts. API clients, translations, auth, feature flags and domain
metadata do not belong in this provider.

Internally, locale, theme/brand and portal configuration use separate contexts.
The public provider composes them; it is not a general service locator.

## DOM scope

`DesignSystemProvider` is intentionally not Fragment-like. It renders a real
`div[data-ds-root]` that owns theme attributes and scoped brand CSS variables.
Consumer `className`, `style` and other `div` attributes apply to that element.

By default the root adds no positioning, transform, containment, dimensions,
overflow, padding or margin. It therefore does not create a containing block or
clip viewport-positioned overlays. Layout behavior is introduced only through
consumer-supplied attributes.

Each root also contains an empty
`div[data-ds-portal-root]`. It uses `display: contents`, has no visual box and
does not intercept pointer events as a container. Normal portal content within
the provider targets this host and inherits the same theme and brand variables.

## Portal target resolution

`DesignSystemProvider.portalContainer` has deliberate three-state semantics:

```text
undefined
→ use this provider's own internal portal host

HTMLElement
→ use that explicit target

null
→ bypass provider hosts and reset to the library default document.body target
```

An inner provider with `undefined` creates its own host rather than inheriting
the outer host. Individual `Portal.container` values still have highest
priority. Outside every provider, `Portal` continues to use `document.body`.
Consumers do not need `portalContainer` merely to preserve provider theming.

## SSR and hydration

No provider or portal module reads `document` during module initialization.
System mode has a deterministic light server snapshot. Portal content renders
no server markup. On the client it waits until the internal host ref is
available, then mounts directly into that host rather than first rendering in
`document.body`.

## Public provider ownership

`DesignSystemProvider` is the recommended application integration root.
`ThemeProvider` remains a public advanced primitive for local theme/brand
scoping when locale and portal environment are not needed. `LocaleProvider`
and the provider-owned portal bridge remain internal. No general
`useDesignSystem` service-locator hook is exported.

## Storybook

Storybook has one global `DesignSystemProvider` decorator. Toolbar globals
control locale, mode and brand stress colors. Component stories should rely on
the global locale unless their purpose is an explicit override or comparison.
The global provider supplies its internal portal host automatically.
