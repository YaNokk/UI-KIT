# Portal contract

`Portal` moves already-mounted React content out of clipping ancestors without
changing its semantics or context. It renders into an explicit `container`,
then the nearest provider portal target, then `document.body`.

When the provider target is an external `DesignSystemProvider.portalContainer`,
the provider synchronizes its resolved theme attributes and generated CSS
variables to that root. The root must be dedicated to one active provider,
inside `body` and outside the application root. Font-face rules remain
document-global and are not part of this synchronization.

`DesignSystemProvider` supplies a boxless internal target inside its own
theme/brand DOM scope. Nested design-system providers supply independent
targets. Public `PortalProvider` remains available for narrower overlay
stacking environments.

DOM access occurs only after the client effect. During SSR and the hydration
render the portal produces no markup. `disabled` deliberately keeps content
in place. Portal does not add modal, focus, dismiss or positioning behavior.
When a provider-owned host is not yet available, Portal waits rather than
briefly falling back to `document.body`.

Nested overlays may place a `PortalProvider` inside their own portal surface so
descendants can share local stacking semantics. Future overlays own that policy.
