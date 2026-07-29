# Designer + Codex: quickstart

Короткий путь для prototype-задачи. Основная ветка этого репозитория —
`master`; если политика репозитория изменится, используйте фактическую
remote default branch.

## 1. Безопасно начните задачу

Codex сначала показывает `git status` и не удаляет незакоммиченные изменения.
При чистой рабочей директории:

```bash
git switch master
git pull --ff-only
git switch -c prototype/<task>
```

Одна задача — одна ветка. Допустимые префиксы:

- `design/` — уточнение дизайна;
- `prototype/` — продуктовый prototype;
- `ux/` — исследование UX-потока.

Не работайте напрямую в `master`.

## 2. Работайте в prototype zone

Размещайте работу по продукту и feature:

```text
prototypes/cashier/<feature>/
prototypes/backoffice/<feature>/
```

Перед новым primitive-like control проверьте public exports, contracts, stories
и Storybook MCP. Переиспользуйте канонические компоненты. Не меняйте
`packages/ui` или `packages/tokens` в рамках prototype-задачи.

## 3. Дайте Codex задачу

```text
Собери prototype Checkout screen.

Работай в:
prototypes/cashier/checkout/

Перед реализацией:
- проверь exports;
- проверь Storybook/MCP;
- найди существующие canonical components.

Используй существующие DS components там, где они подходят.

Не меняй packages/ui и packages/tokens без отдельной задачи.
Можно создавать prototype-local components.

Если нужен отсутствующий DS primitive:
- не реализуй его в packages/ui;
- создай prototype-only placeholder при необходимости;
- зафиксируй missing DS capability.

Добавь Storybook stories в:
Prototypes/Cashier/Checkout/...
```

## 4. Перед PR

Добавьте релевантные default/empty/loading/error/responsive states и README
существенной feature. Запустите prototype-relevant lint, typecheck и Storybook
checks. В PR опишите цель, flow, states, временные решения, missing DS
capabilities и кандидатов на promotion.

Подробности: [designer workflow](./designer-workflow.md) и
[production pipeline](./designer-production-pipeline.md).
