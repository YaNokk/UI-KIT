# Package distribution

## Public packages

Репозиторий сейчас публикует три ESM-пакета:

```text
@mypoint/tokens    0.1.2
@mypoint/ui        0.1.2
@mypoint/retail-ui 0.1.2
```

Custom icon catalog пока отсутствует. Если появится оправданная package
boundary `@mypoint/icons`, пакет остаётся side-effect-free ESM, использует
React как peer dependency, не re-export-ит Lucide и включается в pack,
consumer и tree-shaking checks. Условный publish order:
`tokens → icons → ui → patterns`.

`@mypoint/ui` зависит от `@mypoint/tokens`. React и ReactDOM являются peer
dependencies UI-пакета и не включаются в library bundle. CommonJS build не
создаётся.

## Build and artifact checks

```bash
npm ci
npm run build
npm run pack:check
npm run consumer:test
npm run tree-shaking:test
```

Build создаёт:

```text
packages/tokens/dist/
  index.js
  index.d.ts
  tokens.css
  tailwind.css

packages/ui/dist/
  index.js
  index.d.ts
  Button/
  ButtonLink/
  IconButton/
  Spinner/
  theme/
  fonts.css
  assets/
    inter-regular.woff2
    inter-medium.woff2
    inter-semibold.woff2
    LICENSE-Inter.txt
  styles.css
```

`@mypoint/ui` не навязывает доставку шрифта. Для точного визуального
соответствия consumer выбирает один из двух вариантов:

- самостоятельно загружает Inter в весах 400/500/600 и импортирует только
  `@mypoint/ui/styles.css`;
- импортирует `@mypoint/ui/fonts.css` перед `@mypoint/ui/styles.css` и получает
  одобренные статические WOFF2 из UI-KIT.

Без обоих вариантов token-driven стек использует системный fallback.
`styles.css` сам по себе не содержит `@font-face` и не запрашивает font assets;
`fonts.css + styles.css` запрашивает только Inter 400/500/600. Декларации
`@font-face` глобальны для документа и поэтому действуют также в Dialog,
Drawer, BottomSheet, Select, Popover, Tooltip и external portal container без
копирования в portal root. Theme variables при этом остаются provider-scoped.

Источник, версия, лицензия, хэши и условия распространения зафиксированы в
`docs/licenses/inter.md`; полный текст OFL включается в package assets.

`pack:check` допускает в tarball только `package.json`, `README.md` и `dist/**`.
Tarballs и их manifest сохраняются в `.artifacts/packages/`.

Consumer fixture копируется в `.artifacts/consumer/` и устанавливает именно
эти tarballs, а не workspace symlinks. Проверяются public types, root import,
`@mypoint/ui/button`, `@mypoint/ui/button-link`,
`@mypoint/ui/icon-button`, глобальный CSS и production Vite build.
Также проверяется standalone import `@mypoint/ui/spinner` и два font delivery
графа: styles-only без WOFF2 и explicit `fonts.css + styles.css` ровно с тремя
одобренными WOFF2.

Tree-shaking check собирает отдельные Button-, ButtonLink-, IconButton- и Spinner-only
entries, проверяет удаление неиспользуемого ThemeProvider и icon catalog,
сохранение CSS, независимость Spinner от Button behavior и создание async chunks для динамических Button/ButtonLink
subpath imports.

## Consumer setup

Настройте project-level endpoint, если оба пакета публикуются одним проектом:

```ini
@mypoint:registry=https://gitlab.example.com/api/v4/projects/12345/packages/npm/
//gitlab.example.com/api/v4/projects/12345/packages/npm/:_authToken=${NPM_READ_TOKEN}
always-auth=true
```

Затем:

```bash
npm install @mypoint/ui
```

```tsx
import "@mypoint/ui/styles.css";
import { Button, ThemeProvider } from "@mypoint/ui";

export function App() {
  return (
    <ThemeProvider
      brand={{ accentColor: "#0080ff", foregroundColor: "#ffffff" }}
      mode="light"
    >
      <Button variant="primary">Сохранить</Button>
    </ThemeProvider>
  );
}
```

Опциональная доставка Inter самим UI-KIT:

```tsx
import "@mypoint/ui/fonts.css";
import "@mypoint/ui/styles.css";
```

Tailwind consumer-проекту не требуется. Не импортируйте `src` или внутренние
`dist` paths.

## Consumer authentication

Для нескольких consumer-проектов предпочтителен group Deploy Token только с
`read_package_registry`. Храните его как masked/protected `NPM_READ_TOKEN`.

`CI_JOB_TOKEN` consumer-проекта можно использовать только после настройки
GitLab job-token allowlist / authorized project access. Cross-project доступ
нельзя считать включённым автоматически.

Для пакетов из нескольких GitLab projects можно перейти на group/instance npm
endpoint; выбранный project endpoint сейчас соответствует двум пакетам в одном
репозитории.

Registry credentials остаются server/CI secrets. Не используйте `VITE_`,
`NEXT_PUBLIC_` или `REACT_APP_` для package tokens.

## Local registry configuration

Скопируйте `.env.example` в локальный `.env` и задайте:

```text
GITLAB_HOST
GITLAB_PROJECT_ID
NPM_SCOPE
NPM_READ_TOKEN
```

Создание локального `.npmrc` для установки:

```bash
npm run registry:configure
```

Скрипт не выводит token и откажется перезаписывать существующий `.npmrc`.

Для ручной публикации дополнительно нужен `NPM_PUBLISH_TOKEN` с
`write_package_registry`:

```bash
npm run publish:local
```

Команда выполняет validation, build, pack checks и publish tokens перед UI,
после чего удаляет созданный authenticated `.npmrc`. Обычные releases должны
идти через CI.

## GitLab release pipeline

Pipeline имеет стадии:

```text
validate → build → consumer → publish
```

Publish job запускается только для SemVer-тегов вида `v0.1.0`. Версия тега
обязана совпадать с версиями обоих package manifests. CI создаёт `.npmrc`
динамически и использует:

```text
CI_SERVER_HOST
CI_PROJECT_ID
CI_JOB_TOKEN
```

Ручные publish credentials в GitLab CI для штатного release не нужны.

В GitLab должны быть включены Package Registry и CI/CD. Повторная публикация
существующей версии завершается ошибкой registry.

## Security

Запрещено коммитить:

```text
.env
.env.local
.npmrc с authentication
personal/deploy/access tokens
```

`.env.example` и `.npmrc.example` содержат только placeholders.
