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
