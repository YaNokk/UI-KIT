# Spinner contract

## Purpose

`Spinner` communicates indeterminate progress. It is a standalone feedback
primitive and the canonical loading visual for `Button` and `IconButton`.

## Public API

```ts
type SpinnerSize = "sm" | "md" | "lg";
type SpinnerTone =
  | "current"
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "inverse";

interface SpinnerProps
  extends Omit<
    React.HTMLAttributes<HTMLSpanElement>,
    "children" | "color" | "style"
  > {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  label?: string;
}
```

Defaults are `size="md"` and `tone="current"`.

## Geometry and color

`sm`, `md` and `lg` map directly to `size.icon.sm`, `size.icon.md` and
`size.icon.lg` (16, 20 and 24 px). The progress ring uses one canonical SVG.
Its local unitless stroke width is optical spinner geometry and is not the
Lucide line-icon stroke contract.

`current` inherits the owner color. Other tones map to semantic icon roles;
only `accent` follows runtime brand. Danger remains independent from brand.
Light/dark changes token aliases rather than component markup.

## Accessibility

- Without `label`, the whole Spinner is decorative and hidden from assistive
  technology.
- With `label`, Spinner is a polite `status` and exposes the label through
  visually hidden text; its SVG stays decorative.
- When embedded into an interactive component, Spinner remains decorative.
  The owner keeps its accessible name and owns `aria-busy`, activation
  suppression and form behavior.

## Motion

The ring rotates with the system slow-motion token. Under
`prefers-reduced-motion: reduce`, the ring remains visible but does not rotate.

## Responsive behavior

Spinner never changes size automatically. The selected size remains stable;
the owner or pattern chooses another size when its container requires it.
