# Motion Foundation v1

Motion is a token foundation, not a component animation framework. Durations
are `instant` 0ms, `fast` 120ms, `normal` 180ms and `slow` 240ms. Canonical
easings are `standard`, `enter`, `exit` and `emphasized`.

Semantic roles:

| Role | Mapping | Consumers |
| --- | --- | --- |
| `motion.control.state` | fast + standard | border, background and color state |
| `motion.control.label` | normal + emphasized | FieldShell label transform/color |
| `motion.control.indicator` | fast + standard | Select chevron |
| `motion.overlay.enter` | normal + enter | overlay entry |
| `motion.overlay.exit` | fast + exit | overlay exit |

Components consume semantic duration and easing variables together. Local
duration values and easing strings are forbidden. Under
`prefers-reduced-motion: reduce`, semantic durations resolve to `0ms`; final
geometry and state remain unchanged.

Token admission: shared state, label, indicator and overlay timing was the
missing semantic layer; primitive durations alone could not describe intent.
Motion has no light/dark aliases, is unaffected by runtime brand and does not
change by breakpoint. Reduced motion changes semantic durations only.
