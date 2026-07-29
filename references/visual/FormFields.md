# Form field visual extraction

Source: local MP UI KIT input snapshot in `references/raw/mp-ui-kit/button/input.tsx`
and the repository visual contract.

- Preserve compact enterprise density and restrained 8px control radius.
- Normalize reference geometry to canonical 32/40/48 control heights.
- Prefer neutral surfaces and borders; accent is limited to focus semantics.
- Keep danger state brand-independent and visible in both border and message.
- Use compact canonical typography and 4px-grid spacing.
- Do not inherit hardcoded colors, one-off dimensions, Tailwind class strings,
  framework structure or responsive typography branching.

## v1.1 geometry decisions

The local MP Input snapshot contains a plain external-label-compatible input
and does not contain a floating label or supporting message. Therefore:

- the documented default is `labelView="outer"`; inner is explicit;
- outer label/message gap uses canonical `space.1 = 4px`;
- outer label and hint/error use `typography.bodySm = 13/18`; label adds the
  existing medium weight, hint uses secondary and error uses danger;
- shell inline padding normalizes the MP `px-3` observation into canonical
  `sm=8px`, `md=12px`, `lg=16px`;
- outer heights remain canonical `32/40/48`;
- inner resting label uses the field value role and is vertically centered;
- inner floating label uses existing `typography.caption = 11/16`, starts at
  canonical `space.1`, and value content starts at `space.3`;
- inner `sm` promotes only shell height to canonical 40px because the caption
  and bodySm line boxes cannot fit in 32px; md/lg remain 40/48;
- adornment gap is `space.1` for sm and `space.2` otherwise, while icon sizes
  stay canonical 16/20/24;
- focus keeps `control.borderFocus` plus the canonical focus ring; invalid keeps
  brand-independent `control.borderError`;
- disabled uses disabled foreground/background/border semantics; readOnly uses
  the neutral subtle surface and remains focusable;
- error replaces hint, so the same canonical 4px message gap is stable.

These inner-label decisions normalize onto existing system tokens. They are not
claimed as MP measurements because the supplied MP snapshot has no floating
label example.
