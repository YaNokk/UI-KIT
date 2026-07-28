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
