# Tokens Rules

- DTCG JSON in `src` is the source of truth; never edit `generated` files manually.
- Keep the hierarchy primitive → semantic. Component tokens require a demonstrated repeated need.
- Runtime brand is limited to the documented `brand.*` family.
- Components may consume semantic and brand tokens, never primitive color tokens directly.
- Run `npm run tokens:generate` after source-token changes and `npm run tokens:check` in validation.

