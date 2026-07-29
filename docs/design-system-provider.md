# DesignSystemProvider

`DesignSystemProvider` is the optional application root for design-system
runtime configuration. Components remain usable without it.

```tsx
<DesignSystemProvider
  brand={{ accentColor: "#7c3aed", foregroundColor: "#ffffff" }}
  locale="ru-RU"
  mode="system"
  portalContainer={overlayRoot}
>
  <App />
</DesignSystemProvider>
```

## Runtime API

- `locale` configures formatting. A component's explicit locale wins.
- `mode` accepts `light`, `dark` or `system`. System preference is resolved at
  the provider layer, not by individual components.
- `brand` uses the canonical `BrandInput` contract. The resolver writes scoped
  semantic CSS variables; components do not read backend colors in React.
- `portalContainer` configures the existing `Portal` abstraction. `undefined`
  inherits the surrounding portal environment; `null` retains the normal
  client fallback to `document.body`.
- ordinary `div` attributes apply to the provider's visual scope.

Direction is not exposed in v1 because the component system does not yet have a
verified RTL contract.

## Defaults and nesting

Without a provider, locale falls back deterministically to `en-US`, theme mode
uses the existing `system` preference with a light SSR snapshot, brand uses the
canonical default input, and portals mount to `document.body` after hydration.

Nested providers override supplied values and inherit omitted values. A nested
locale override therefore does not reset its parent's brand, mode or portal
target.

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

## SSR and portals

No provider or portal module reads `document` during module initialization.
System mode has a deterministic light server snapshot. Portal content renders
only after client mount. When overlays must inherit scoped brand/theme CSS
variables, configure a portal container inside the corresponding provider
scope.

## Storybook

Storybook has one global `DesignSystemProvider` decorator. Toolbar globals
control locale, mode and brand stress colors. Component stories should rely on
the global locale unless their purpose is an explicit override or comparison.
