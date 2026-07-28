# Design System Registry

Здесь хранятся только authored-факты, которые нельзя получить из TypeScript и Storybook:

- `patterns.json` — UX-композиции и responsive contracts;
- `domain-rules.json` — продуктовая семантика;
- `references.json` — связи с извлечёнными референсами.

Component API, props и stories не дублируются вручную. `schemas/component-manifest.schema.json` описывает будущий generated manifest, который должен строиться из TypeScript/Storybook и оставаться disposable.

