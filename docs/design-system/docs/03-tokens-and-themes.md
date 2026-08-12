# 03. Tokens and Themes

## Objective

Tokens are a controlled vocabulary of design decisions. They must reduce choices, not create a second CSS language with hundreds of aliases.

The architecture must support simultaneously:
- mobile / tablet / desktop;
- light / dark mode;
- runtime white-label brand accent from backend;
- MP UI KIT visual direction;
- AI-assisted implementation without token proliferation.

## Strict hierarchy

```text
PRIMITIVE
raw scales/values
     ↓
SEMANTIC
product meaning
     ↓
COMPONENT
only when semantic layer is insufficient
     ↓
LOCAL
truly unique implementation detail
```

A component should normally consume semantic tokens.

## 1. Primitive tokens

Primitives describe value scales, not usage.

Examples:

```text
color.neutral.0 ... 950
color.red.*
color.amber.*
color.green.*
space.0/1/2/3/4/5/6/8/10/12/16
font.family.sans
font.size.*
font.weight.*
lineHeight.*
radius.*
shadow.*
motion.*
size.control.*
size.icon.*
zIndex.*
```

Feature/product screens must not use primitive color values directly.

## 2. Semantic tokens

Semantic tokens describe visual roles. This is the stable API between styling and components.

### Background

```text
background.page
background.surface
background.surfaceRaised
background.subtle
background.selected
background.overlay
background.inverse
```

### Text

```text
text.primary
text.secondary
text.tertiary
text.placeholder
text.disabled
text.onAccent
text.onDanger
text.onInverse
```

### Icon

```text
icon.primary
icon.secondary
icon.tertiary
icon.disabled
icon.accent
icon.danger
icon.success
icon.warning
icon.onAccent
```

Иконки используют `currentColor`; canonical geometry, slot ownership и
asset-классификация описаны в `../../icons-and-assets.md`.

### Border

```text
border.default
border.strong
border.subtle
border.focus
border.danger
```

### Scrollbar

```text
scrollbar.thumb
scrollbar.thumbHover
size.scrollbar.default
size.scrollbar.compact
```

Scrollbar colors are neutral, mode-aware and independent from runtime brand.
The visual contract is opt-in and never creates a scroll container itself.

### Sidebar geometry

```text
size.sidebar.expanded
size.sidebar.collapsed
size.sidebar.flyoutMin
size.sidebar.flyoutMax
```

These canonical component dimensions express stable navigation geometry, not
spacing. They are mode-, brand- and viewport-independent; responsive shell
orchestration remains a consumer responsibility.

### Control

```text
control.background
control.backgroundHover
control.backgroundDisabled
control.border
control.borderHover
control.borderFocus
control.borderError
control.selectionIndicator
control.selectionIndicatorHover
control.selectionIndicatorActive
control.text
control.placeholder
control.icon
control.iconHover
```

### Action

```text
action.primary.background
action.primary.backgroundHover
action.primary.backgroundActive
action.primary.foreground

action.secondary.background
action.secondary.backgroundHover
action.secondary.backgroundActive
action.secondary.foreground

action.soft.background
action.soft.backgroundHover
action.soft.backgroundActive
action.soft.foreground

action.ghost.backgroundHover
action.ghost.foreground

action.danger.background
action.danger.backgroundHover
action.danger.backgroundActive
action.danger.foreground
```

### Status

```text
status.success.background
status.success.foreground
status.success.border
status.warning.*
status.danger.*
status.info.*
```

Status colors are independent from brand accent.

### Navigation

```text
navigation.background
navigation.surface
navigation.border
navigation.item.background
navigation.item.backgroundHover
navigation.item.backgroundActive
navigation.item.text
navigation.item.textHover
navigation.item.textDisabled
navigation.item.textActive
navigation.item.icon
navigation.item.iconHover
navigation.item.iconDisabled
navigation.item.iconActive
```

Navigation is an intentionally persistent dark/inverse surface in both light
and dark application themes. Mode may tune its neutral aliases, while runtime
brand affects active/accent states rather than the base navigation surface.

### Focus

```text
focus.ring
focus.ringOffset
focus.ringWidth
```

## 3. Runtime brand tokens

Brand is a bounded runtime input family, not a free theme editor.

Backend input:

```text
accentColor
foregroundColor
```

Theme engine resolves it into:

```text
brand.accent
brand.preferredOnAccent
brand.onAccent
brand.accentContent
brand.accentHover
brand.accentActive
brand.accentSoft
brand.accentSoftHover
brand.accentSoftActive
brand.accentSoftForeground
brand.accentBorder
brand.accentFocus
brand.actionBackground
brand.actionBackgroundHover
brand.actionBackgroundActive
brand.actionForeground
brand.selectionIndicator
brand.selectionIndicatorHover
brand.selectionIndicatorActive
```

`brand.accent` preserves the supplied identity color. Primary actions alias the
separate, contrast-safe `brand.action*` palette; soft actions alias the
mode-aware `brand.accentSoft*` surfaces and `brand.accentContent`.
Semantic navigation, selection and focus tokens may alias the appropriate
identity roles.

`brand.selectionIndicator*` is resolved against the mode-specific neutral
control surface with at least 3:1 non-text contrast. Semantic
`control.selectionIndicator*` aliases expose that reusable checked
outline/dot/icon role without making components derive or darken backend
colors locally. The role is brand- and mode-aware, does not vary by viewport,
and is separate from filled-action contrast.

Brand must not alter spacing, typography, radius, neutral surfaces, control sizes, success/warning/danger or breakpoints.

See `10-runtime-brand-theming.md`.

## 4. Component tokens

Component tokens are exceptional.

Good reason:

```text
button.loading.spinnerSize
```

if this value is genuinely part of a stable Button contract and is not represented by existing size/icon semantics.

Bad reason:

```text
button.blue
button.padding17
ordersTableGray
phoneGreen
```

Do not mirror every CSS property into component tokens.

## Token admission checklist

Before adding any token, answer:
1. What reusable semantic role is missing?
2. Why can an existing token not express it?
3. What is its correct layer: primitive, semantic, component or local?
4. What happens in light/dark mode?
5. Does runtime brand affect it? Why?
6. Is it responsive or container-dependent? Why?
7. Is it needed by more than one concrete state/use case?

AI must not add a token only because a Core DS or MP UI KIT reference contains a value.

## Recommended foundations

### Color

Start with bounded palettes:
- neutral;
- success/green;
- warning/amber;
- danger/red;
- default brand seed for development.

Runtime customer/platform brand is separate from the static default palette.

### Typography

The MP UI KIT reference supports a compact enterprise type hierarchy:

```text
caption       11/16
bodySm        13/18
body          14/20
bodyStrong    14/20
bodyLg        16/24
headingSm     16/24
headingMd     18/26
headingLg     22/30
pageTitle     28/36
```

Expose semantic text styles to components/patterns. Do not require screens to choose raw font-size/line-height pairs.

### Spacing

4px grid:

```text
0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

Main operational UI should heavily reuse 4/8/12/16/24/32.

Do not create `18px`, `22px`, etc. simply to reproduce a screenshot pixel-for-pixel.

### Sizing

Normalize reference values to a small system:

```text
control.sm = 32
control.md = 40
control.lg = 48

icon.sm = 16
icon.md = 20
icon.lg = 24

tableRow.compact = 40
tableRow.default = 48
tableRow.comfortable = 56
```

Visual control height and touch target may differ on mobile; accessibility/touch target rules belong to component/pattern behavior.

### Radius

```text
sm = 4
md = 6
lg = 8
xl = 12
full = 9999
```

The expected product direction should use `lg≈8px` as the common container/control visual language rather than large rounded marketing cards.

### Border

```text
width.default = 1
width.strong = 2
```

### Shadow

```text
none
sm → dropdown/popover
md → floating surface
lg → modal/elevated overlay when needed
```

Ordinary surfaces should prefer background/border hierarchy over shadow.

### Motion

```text
fast = 100ms
normal = 150ms
slow = 250ms
```

Respect `prefers-reduced-motion`.

### Z-index

```text
default     0
focused   100
sticky    100
navigation 200
popover   300
modal     500
toast     600
```

Dropdown-like floating UI uses the canonical `popover` layer. Modal backdrops
and surfaces are owned by the modal runtime within the `modal` contract. The
system did not expose public `dropdown` or `overlay` z-index tokens before
`navigation` was added, so no compatibility aliases are required. The invariant
is `sticky/focused < navigation < popover < modal < toast`.

## Theme model

Light/dark changes semantic aliases, not component code.

```text
primitive neutrals/status colors
            ↓
light semantic aliases
            or
 dark semantic aliases
            +
runtime brand family
            ↓
components
```

Dark theme is not color inversion. Surfaces, borders, text and accent-soft variants are reviewed independently.

## Responsive tokens

Do not create a complete duplicate token tree for mobile/tablet/desktop.

Foundations should remain stable. Responsive behavior is normally expressed by:
- component size variants;
- pattern layout rules;
- container queries;
- a small set of layout/breakpoint tokens.

Only create viewport-specific semantic values when the same semantic role genuinely changes across form factors, for example page gutter/layout density.

## Source of truth

Preferred source format: DTCG-compatible JSON or another typed registry that can generate:
- CSS custom properties;
- Tailwind theme variables/utilities;
- TypeScript metadata/types;
- token documentation.

Generated files are not edited manually.

## Naming rules

Prefer role-based names:

```text
background.surface
text.secondary
control.borderFocus
action.primary.backgroundHover
```

Reject names based on:
- literal visual color (`lightGray2`);
- component accident (`blueButton`);
- one screen (`ordersHeaderGray`);
- platform/customer name;
- reference implementation naming unless it maps cleanly to our semantics.

## Reference policy

MP UI KIT can suggest missing semantic categories and visual relationships. Core DS can suggest component states/use cases. Neither may directly write new tokens into the system.
