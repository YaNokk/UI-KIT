# PasswordInput behavioral extraction

Source: local Core DS snapshot in `references/raw/core-ds/password-input`.

- Useful behavior: compose Input, toggle only native type, preserve value and
  expose controlled visibility change.
- Adopted: controlled/uncontrolled visibility and native IconButton action.
- Added: explicit localized accessible names and `defaultVisible`.
- Normalized: `visible`/`onVisibleChange` naming and canonical Lucide Eye icons.
- Dropped: reference colors, numeric sizes and title-only naming.
- Autocomplete remains caller-owned for current/new password use cases.
- The local reference composes Input with an IconButton in the right-addon
  column. Our PasswordInput keeps the same structural principle: the full-size
  native password input owns caret/focus interaction, while the visibility
  IconButton remains an independent sibling action with its own keyboard,
  pointer and accessible-name behavior.
