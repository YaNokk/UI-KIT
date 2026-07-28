# Portal contract

`Portal` moves already-mounted React content out of clipping ancestors without
changing its semantics or context. It renders into an explicit `container`,
then the nearest `PortalProvider` root, then `document.body`.

DOM access occurs only after the client effect. During SSR and the hydration
render the portal produces no markup. `disabled` deliberately keeps content
in place. Portal does not add modal, focus, dismiss or positioning behavior.

Nested overlays may place a `PortalProvider` inside their own portal surface so
descendants can share local stacking semantics. Future overlays own that policy.
