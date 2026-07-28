# Patterns Rules

- Patterns compose public `@mypoint/ui` APIs and never reach into component internals.
- Every pattern documents minimum width, narrow/mobile, tablet and desktop behavior.
- Viewport queries belong to app-shell/screen layout; reusable compositions prefer container queries.
- Pattern facts live in `packages/design-system-registry`, not in a duplicate component registry.
