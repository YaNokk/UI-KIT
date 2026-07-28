# IconButton contract

## Purpose

`IconButton` triggers an icon-only action. It is a separate primitive, not a
mode of `Button`, and does not support navigation in v1.

## Public API

```ts
type IconButtonVariant =
  | "primary"
  | "secondary"
  | "soft"
  | "ghost"
  | "danger";

type IconButtonSize = "sm" | "md" | "lg";
```

The component inherits native button attributes except `children`, raw visual
props and accessible-name fields. Usage must provide either a non-empty
`aria-label` or `aria-labelledby`.

```text
variant  ghost
size     md
disabled false
loading  false
type     button
```

## Geometry

| Size | Control | Icon |
|---|---:|---:|
| `sm` | `size.control.sm` — 32 px | `size.icon.sm` — 16 px |
| `md` | `size.control.md` — 40 px | `size.icon.md` — 20 px |
| `lg` | `size.control.lg` — 48 px | `size.icon.lg` — 24 px |

The control is square and uses `radius.lg`. A round/pill shape is not admitted
without a real product need.

## Variants

- `ghost`: neutral toolbar and row action; transparent at rest.
- `secondary`: neutral action with a visible surface and border.
- `soft`: low-emphasis brand action.
- `primary`: exceptional high-emphasis icon-only action.
- `danger`: destructive action independent from runtime brand.

No component-specific color tokens are needed. Variants use existing
`action.*`, background interaction, icon and focus semantics.

## Icon slot

The slot accepts a Lucide icon or admitted custom icon node, sets its rendered
size and `currentColor`, and hides it from assistive technology. Consumers do
not pass arbitrary icon size, color or stroke overrides.

## Loading and disabled

`disabled` uses the native attribute. `loading` preserves geometry, focus and
the accessible name, exposes `aria-busy=true` and `aria-disabled=true`, and
suppresses pointer, keyboard, programmatic and capture activation without
setting native disabled. A loading submit control does not submit its form.
The visual is the canonical decorative `Spinner` in `currentColor`;
IconButton remains the owner of name, busy state and activation policy.

## Responsive behavior

The selected size does not change automatically with viewport. Patterns own
size selection and touch-target decisions.
