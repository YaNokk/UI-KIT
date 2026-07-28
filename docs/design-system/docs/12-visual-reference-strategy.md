# 12. Visual Reference Strategy — MP UI KIT

## Purpose

MP UI KIT is the target visual direction, not an architecture reference.

It demonstrates a useful product aesthetic but its implementation contains multiple overlapping UI/styling layers. We want to extract visual rules and discard architectural entropy.

## Reference roles

```text
Core DS → behavior / API / edge cases
MP UI KIT → visual density / hierarchy / composition direction
Our design system → source of truth
```

Neither external project is allowed to create tokens or dependencies directly in production UI.

## Visual direction to preserve

- compact enterprise UI rather than marketing-style whitespace;
- cool neutral page/surface hierarchy;
- white/light surfaces with subtle neutral separation;
- strong accent for interaction, not decoration;
- pale accent surfaces for selected/active state;
- moderate radius around 8px, not oversized cards;
- borders/surface contrast more often than large shadows;
- dense toolbars and filters;
- restrained line iconography;
- semantic status colors independent from brand accent;
- clear hierarchy through type, spacing and surface levels.

## Visual anti-patterns

Codex should avoid unless a product requirement explicitly needs them:
- gradients as decoration;
- glassmorphism;
- large ambient shadows;
- 16–24px radius everywhere;
- card-for-every-section layout;
- oversized marketing typography;
- excessive whitespace in operational screens;
- arbitrary accent-tinted large backgrounds;
- hardcoded visual values copied from the reference project.

## Token consequences

The reference justifies these semantic categories.

### Background/surface

```text
background.page
background.surface
background.surfaceRaised
background.subtle
background.selected
background.overlay
```

### Text

```text
text.primary
text.secondary
text.tertiary
text.placeholder
text.disabled
text.onAccent
```

### Icon

```text
icon.primary
icon.secondary
icon.tertiary
icon.disabled
icon.accent
icon.onAccent
```

### Control

```text
control.background
control.backgroundHover
control.backgroundDisabled
control.border
control.borderHover
control.borderFocus
control.borderError
control.text
control.placeholder
control.icon
control.iconHover
```

### Navigation

```text
navigation.item.background
navigation.item.backgroundHover
navigation.item.backgroundActive
navigation.item.text
navigation.item.textActive
navigation.item.icon
navigation.item.iconActive
```

All values alias primitives or brand runtime semantics. These categories are not permission to create component-specific colors ad hoc.

## Typography direction

Use a compact product scale instead of blindly exposing a generic Tailwind type scale:

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

A larger display token may exist only when a real product screen needs it.

## Sizing direction

Normalize irregular visual-reference sizes to a consistent scale:

```text
control.sm = 32
control.md = 40
control.lg = 48
```

Do not encode one-off 45/46/52px values as new global tokens.

## Recommended extracted patterns

Use MP UI KIT as visual reference for:
- FilterToolbar / FilterBar;
- DenseEntityTable;
- EntityList;
- ModalForm;
- DetailDrawer;
- compact MetricCard;
- Receipt;
- ClientSearch.

Patterns must still be implemented using our components/tokens and responsive rules.

## Repository placement

```text
references/
  visual/
    mp-ui-kit/
      visual-contract.md
      token-observations.md
      patterns/
      screenshots/
  raw/
    mp-ui-kit/       # optional read-only project snapshot
```

The summarized visual contract should be provided to the agent before raw source.

## Codex rule

Use MP UI KIT to answer: "what should this feel/look like?"

Never use it to answer:
- how packages are structured;
- which styling libraries to install;
- which component dependency graph to reproduce;
- which hardcoded token values should be copied blindly.
