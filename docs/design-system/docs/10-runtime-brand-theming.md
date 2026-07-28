# 10. Runtime Brand Theming

## Goal

White-label branding must change the product identity without changing the design system itself.

The backend currently provides:

```ts
interface PlatformAppearance {
  accentColor: string;
  foregroundColor?: string;
}
```

These values are runtime inputs, not semantic tokens and not component styles.

## Three independent axes

```text
DESIGN SYSTEM
geometry / typography / spacing / radius / layout / motion
        ×
COLOR MODE
light / dark
        ×
BRAND
accent / on-accent
```

A platform may change the brand and the user may change light/dark mode. Neither is allowed to fork component geometry.

## Runtime pipeline

```text
backend accentColor + foregroundColor
          ↓
validate / normalize
          ↓
brand palette generator
          ↓
brand runtime tokens
          ↓
semantic tokens
          ↓
components / patterns
```

Components never read backend settings directly.

## Runtime brand tokens

The theme engine may expose only this bounded family:

```text
brand.accent
brand.onAccent
brand.accent.hover
brand.accent.active
brand.accent.soft
brand.accent.softHover
brand.accent.softForeground
brand.accent.border
brand.accent.focus
```

`accentColor` is the seed. Derived colors are generated centrally, preferably in a perceptual color space such as OKLCH, and then contrast-checked.

`foregroundColor` is a preference, not an unconditional truth. If contrast is insufficient, the theme engine chooses a safe on-accent foreground.

## What brand is allowed to affect

Recommended:
- primary actions;
- links;
- checked checkbox/radio/switch;
- active tab indicator;
- focus ring;
- selected navigation item;
- selected/active filters;
- pagination active state;
- selection backgrounds via `accent.soft`;
- informational accent where it does not conflict with semantic status.

Brand must not redefine:
- page/surface neutral backgrounds;
- body text;
- ordinary borders;
- success/warning/danger colors;
- spacing;
- typography;
- radius;
- shadows;
- control heights;
- breakpoints.

## Mode tokens vs brand tokens

Light/dark themes define neutral/system semantics:

```text
background.page
background.surface
background.subtle
background.elevated
text.primary
text.secondary
text.tertiary
border.default
border.strong
control.background
...
```

Brand defines only accent semantics.

`accent.soft` must be mode-aware. A pale accent surface for light mode must not be reused unchanged in dark mode.

## React boundary

`ThemeProvider` resolves mode and brand and writes CSS variables to a root scope. Components consume CSS variables; they should not call `useTheme()` just to get colors.

```tsx
<ThemeProvider
  mode={settings.colorMode}
  brand={{
    accentColor: platform.accentColor,
    foregroundColor: platform.foregroundColor,
  }}
>
  <App />
</ThemeProvider>
```

Suggested root output:

```html
<div data-theme="dark" data-brand-theme style="--brand-accent: ...">
```

This keeps the system compatible with nested/embedded scopes in the future.

## Platform overrides

Do not create platform-specific component forks such as:

```text
[data-platform=a] .button
[data-platform=b] .input
```

A platform is allowed to provide identity inputs. It does not own foundation values.

If future business requirements require additional safe branding controls, extend a bounded `PlatformAppearance` contract and document each field. Do not expose arbitrary token overrides from the backend.

## Stress-test matrix

Every accent-sensitive component must be reviewed against:

```text
light / dark
×
blue / green / purple / yellow / near-black accent
```

At minimum test:
- Button;
- Input focus;
- Checkbox/Radio/Switch;
- Tabs;
- Navigation active state;
- Select/menu selection;
- Table selected row;
- Pagination;
- focus-visible states.

Yellow and near-black are deliberate stress colors for contrast failures.
