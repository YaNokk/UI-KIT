# Core DS Spinner — extracted behavioral reference

Source reviewed: `core-ds/core-components`, `packages/spinner`, master branch,
2026-07-28.

## Useful behavioral ideas

- A spinner is a dedicated progress primitive rather than SVG markup repeated
  by every owner.
- The reference distinguishes preset sizes from custom geometry and supports
  contextual/inverted color treatment.
- Visibility, sizing and visual color are separate concerns.
- Tests cover public size/configuration choices and rendered SVG geometry.

## Decisions for MyPoint

- Keep only three design-system sizes: `sm`, `md`, `lg`, mapped to existing
  `size.icon.*` tokens. Numeric size and line-width props are rejected.
- Use semantic tones plus `currentColor`; arbitrary inline color is rejected.
- Use one canonical ring and no visibility prop. Consumers render Spinner only
  while progress is active.
- Add an explicit standalone accessibility contract through `label`.
- Embedded Button/IconButton spinners are decorative because the interactive
  owner retains its name and busy state.
- Respect reduced motion by leaving a visible, non-rotating ring.

No Core DS CSS, Alfa tokens, package architecture or implementation code is
copied. Repository contracts and tokens remain the source of truth.
