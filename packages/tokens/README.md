# Tokens

Source of truth:

- `src/primitive/primitive.tokens.json`;
- `src/themes/light.semantic.tokens.json`;
- `src/themes/dark.semantic.tokens.json`;
- `src/brand/default.brand.tokens.json`.
- `src/brand/default.dark.brand.tokens.json`.

`scripts/generate.mjs` валидирует aliases и симметрию light/dark paths, затем генерирует:

- `generated/tokens.css`;
- `generated/tailwind.css`;
- `src/generated/tokens.ts`.

`runtime-brand.ts` валидирует backend inputs, выбирает безопасный `onAccent` с contrast не ниже 4.5:1 и создаёт только разрешённые brand variables. Status, neutral surfaces, sizing и geometry не зависят от brand.

Icon foundation задаёт `size.icon.sm/md/lg = 16/20/24`,
`icon.stroke.default = 2` и semantic tones, описанные в
`../../docs/icons-and-assets.md`.
