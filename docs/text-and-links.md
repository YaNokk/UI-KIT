# Text and links

Use `Text` for standalone text and `Heading` for intentional heading hierarchy.
Do not wrap labels already owned by primitives such as `Button`.

```text
navigation + link visuals   → Link       → <a href>
action + link visuals       → LinkButton → <button type="button">
navigation + button visuals → ButtonLink → <a href> (contract only in v1)
action + button visuals     → Button     → <button>
```

Inline links are underlined by default so interaction is not communicated only
by color. Standalone links are undecorated until hover. `external` adds
`rel="external"` metadata and does not force a new browsing context.

There is no disabled `Link`: unavailable navigation should be omitted or shown
as non-interactive text. `LinkButton` uses native `disabled`.

The core package has no router dependency. Applications may build adapters
without changing the DOM semantics above.
