# PasswordInput behavioral extraction

Source: local Core DS snapshot in `references/raw/core-ds/password-input`.

- Useful behavior: compose Input, toggle only native type, preserve value and
  expose controlled visibility change.
- Adopted: controlled/uncontrolled visibility and native IconButton action.
- Added: explicit localized accessible names and `defaultVisible`.
- Normalized: `visible`/`onVisibleChange` naming and canonical Lucide Eye icons.
- Dropped: reference colors, numeric sizes and title-only naming.
- Autocomplete remains caller-owned for current/new password use cases.
