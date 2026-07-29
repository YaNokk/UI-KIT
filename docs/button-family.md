# Button family and progress ownership

## Architecture

```text
private Button visuals
├── Button       → native button action
└── ButtonLink   → native anchor navigation

IconButton       → separate icon-only native button action
Spinner          → standalone indeterminate progress visual
```

`Button` and `ButtonLink` share variant, size, typography, padding, gap,
radius, icon-slot and focus visuals. They do not share DOM semantics or
button-only behavior. `IconButton` remains a separate action primitive.

## Optical label alignment

Button-family labels are tight single-line control text. The shared visual
foundation may trim the font line box with `text-box-trim` and
`text-box-edge` to align visible glyph bounds when the browser supports it.
This is a progressive enhancement guarded by `@supports`: unsupported
browsers keep the canonical line-height, padding and control height as an
acceptable fallback.

The rule remains local to the shared Button/ButtonLink label. It is not part
of global typography roles and must not be replaced with pixel offsets,
negative margins, asymmetric padding or size-specific geometry. A shared
control-label utility is justified only after another independent control
family proves the same requirement.

The `Button / TypographyAlignment` Storybook story covers `sm`, `md` and `lg`
with Latin, Cyrillic, descender and numeric labels, icon combinations,
loading layout and ButtonLink parity.

## Icon slots

`startIcon`, `endIcon` and the `IconButton` icon are decorative slots. The
owner sets rendered size, `currentColor`, alignment and `aria-hidden`; visible
Button/ButtonLink text or the IconButton accessible-name prop owns the name.

## Loading

`Button` and `IconButton` use the public canonical `Spinner` internally with
`tone="current"` and the owner size. Spinner is decorative in this context.
The interactive owner:

- preserves its accessible name and focus;
- exposes `aria-busy=true` and `aria-disabled=true`;
- keeps native button geometry;
- suppresses pointer, Enter, Space, capture and programmatic activation;
- prevents loading submit controls from submitting their form.

`ButtonLink` has no loading or disabled state because a native anchor does not
provide those action semantics.

Future controls such as Input may use Spinner only after defining ownership,
placement, accessible status and activation/editing behavior in their own
contract. They must not duplicate the ring SVG.
