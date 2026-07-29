# Design System Foundation

Монорепозиторий дизайн-системы MyPoint.

## Структура

- `packages/tokens` — DTCG sources, semantic themes и runtime brand resolver;
- `packages/ui` — React-компоненты и ThemeProvider;
- `packages/patterns` — композиционный слой будущих product patterns;
- `packages/design-system-registry` — authored registry и schemas;
- `apps/storybook` — документация компонентов и brand/theme stress controls;
- `prototypes` — изолированная experimental workspace дизайнера;
- `fixtures/vite-react` — clean packed-package consumer.

Публичные пакеты:

```text
@mypoint/tokens
@mypoint/ui
```

## Команды

```bash
npm ci
npm run tokens:check
npm run lint
npm run typecheck
npm test
npm run build
npm run pack:check
npm run consumer:test
npm run tree-shaking:test
```

Generated token files не редактируются вручную.

Icon source, custom-icon admission, asset classification, accessibility и
tree-shaking описаны в
[`docs/icons-and-assets.md`](docs/icons-and-assets.md).

## Package distribution

`npm run build` создаёт ESM packages и declarations. `npm run pack:check`
проверяет реальное содержимое tarball, после чего consumer fixture устанавливает
оба `.tgz`, запускает typecheck и production build. Releases публикуются в
GitLab Package Registry только pipeline для SemVer-тегов.

Настройка registry, локальная публикация, consumer authentication и требуемые
environment variables описаны в
[`docs/package-distribution.md`](docs/package-distribution.md).

## Designer + Codex

Prototype-процесс, безопасная работа с git и promotion описаны в:

- [`docs/designer-codex-quickstart.md`](docs/designer-codex-quickstart.md);
- [`docs/designer-workflow.md`](docs/designer-workflow.md);
- [`docs/designer-production-pipeline.md`](docs/designer-production-pipeline.md).

Scoped-ограничения experimental workspace находятся в
[`prototypes/AGENTS.md`](prototypes/AGENTS.md).
