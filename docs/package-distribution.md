# Package distribution

## Public packages

Репозиторий сейчас публикует два ESM-пакета:

```text
@mypoint/tokens 0.1.0
@mypoint/ui     0.1.0
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
  theme/
  styles.css
```

`pack:check` допускает в tarball только `package.json`, `README.md` и `dist/**`.
Tarballs и их manifest сохраняются в `.artifacts/packages/`.

Consumer fixture копируется в `.artifacts/consumer/` и устанавливает именно
эти tarballs, а не workspace symlinks. Проверяются public types, root import,
`@mypoint/ui/button`, `@mypoint/ui/button-link`,
`@mypoint/ui/icon-button`, глобальный CSS и production Vite build.

Tree-shaking check собирает отдельные Button-, ButtonLink- и IconButton-only
entries, проверяет удаление неиспользуемого ThemeProvider и icon catalog,
сохранение CSS и создание async chunks для динамических Button/ButtonLink
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
