# Portal behavioral extraction

Source: local Core DS snapshot in `references/raw/core-ds/portal`.

- Useful behavior: deferred client mount, configurable target and React portal
  context preservation.
- Adopted: SSR-safe client effect, explicit container and configured root.
- Normalized: direct HTMLElement API instead of a callback/config package.
- Added locally: `disabled` in-place mode and nearest `PortalProvider`.
- Dropped: immediate mount, because it risks hydration divergence and is not
  required by the v1 overlay foundation.
- Portal alone adds no accessibility, focus, positioning or modal behavior.
