# Link behavioral reference

Source: Core DS Link package, reviewed for API, state and accessibility ideas
only.

## Retained concepts

- Native anchor attributes and refs are forwarded.
- Decoration is an explicit visual decision.
- Focus, long labels, tones and edge states require stories/tests.
- A link-like action uses native button semantics and defaults to
  `type="button"`.

## Rejected or normalized

- One polymorphic component that switches among anchor, button and router
  components is rejected.
- Pseudo links and anchors without navigation are rejected.
- Router-specific `href` to `to` conversion is rejected; core UI stays
  router-independent.
- Alfa-specific views, colors, inverted themes, addons and styling are not
  copied.
- External URLs do not imply `target="_blank"`.

## Local contract

`Link` is navigation and requires `href`. `LinkButton` is an action. They share
an internal visual layer but not DOM semantics. Inline links are underlined by
default; standalone links add decoration on hover. There is no disabled Link
in v1.
