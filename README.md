# Design System Foundation

Реализована Iteration 0 из `docs/design-system/docs/13-project-start-guide.md`.

## Структура

- `packages/tokens` — DTCG token sources, generated CSS/Tailwind bridge, typed metadata и runtime brand adapter;
- `packages/ui` — theme boundary; публичные product components намеренно ещё отсутствуют;
- `packages/patterns` — пустой public layer до первого vertical slice;
- `packages/design-system-registry` — authored pattern/domain/reference registry и schemas;
- `apps/storybook` — executable foundation documentation с light/dark/system и brand stress controls;
- `references` — раздельные behavioral/visual/raw reference areas.

## Команды

```bash
npm install
npm run tokens:generate
npm run tokens:check
npm run lint
npm run typecheck
npm run storybook
```

Generated token files не редактируются вручную.

## Границы итерации

Button относится к Iteration 1 и не реализован: для него документация требует предварительный `Button.contract.md` на основе Core DS Button и MP UI KIT, которых в исходном архиве нет.

Runtime brand принимает только `accentColor` и опциональный `foregroundColor`, проверяет HEX и WCAG contrast, затем создаёт ограниченную accent-family. Производные цвета сейчас рассчитываются детерминированным смешиванием sRGB; переход на OKLCH оставлен заменяемой внутренней деталью и не меняет публичный контракт.

