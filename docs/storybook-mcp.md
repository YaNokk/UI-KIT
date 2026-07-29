# Storybook MCP

Storybook MCP предоставляет агентам переносимую точку доступа к актуальному
каталогу stories. Интеграция предназначена только для локальной разработки и не
входит в runtime или public API пакета `@mypoint/ui`.

## Локальный запуск

Установите зависимости и запустите обычный Storybook:

```shell
npm install
npm run storybook
```

Addon `@storybook/addon-mcp`, подключённый в
`apps/storybook/.storybook/main.ts`, автоматически публикует Streamable HTTP MCP
endpoint:

```text
http://localhost:6006/mcp
```

Отдельный MCP-процесс не требуется. В MCP-клиенте зарегистрируйте этот URL как
Streamable HTTP server. Регистрация относится к настройкам конкретного клиента и
не должна коммититься в репозиторий.

Пока Storybook работает, соединение, набор MCP tools и наличие канонических
field stories можно проверить командой:

```shell
npm run storybook:mcp:check
```

Для другого адреса передайте `STORYBOOK_URL`.

PowerShell:

```powershell
$env:STORYBOOK_URL = "http://127.0.0.1:7007"
npm run storybook:mcp:check
```

POSIX shell:

```shell
STORYBOOK_URL=http://127.0.0.1:7007 npm run storybook:mcp:check
```

## Канонические field stories

Для проверки interaction model используются:

- Input / Interaction Anatomy
- Input / Cursor Areas
- Input / Hit Areas
- Input / Floating Label Geometry
- Input / Floating Label Md Reference
- PasswordInput / Cursor Areas
- PasswordInput / Toggle Hit Area
- PasswordInput / Inner Label

`storybook:mcp:check` проверяет их стабильные story ID через `/index.json`.
Stories должны оставаться детерминированными: без внешней сети, случайных данных
и скрытой зависимости от состояния приложения.

## Что проверяется где

Unit и story `play` tests проверяют DOM-контракты, keyboard behavior, native
label semantics и ожидаемые состояния. Browser-проверка обязательна для того,
что JSDOM не моделирует достоверно:

- computed `cursor` над native input, label, decorative и interactive adornments;
- реальный переход focus при клике по label и decorative adornment;
- независимый focus и activation интерактивного adornment;
- фактические bounding boxes и точки hit area;
- floating/resting label geometry и совпадение Input с PasswordInput.

После изменений pointer-, focus- или field-geometry откройте канонические stories
через URL, возвращённые MCP tool `get_story_urls`, и выполните проверки в
настоящем браузере. Скриншот сам по себе не доказывает значение cursor или
focus — для них нужен computed style и `document.activeElement`.

## Ограничения и CI

- MCP endpoint существует только при запущенном Storybook dev server.
- Addon имеет preview-статус; после обновления проверяйте протокол и имена tools.
- MCP помогает обнаруживать stories, но не заменяет типы, tokens, tests и ручную
  оценку оптической геометрии.
- Проверка пока не является блокирующим CI job: для неё нужен отдельный жизненный
  цикл Storybook server. Скрипт сделан детерминированным, чтобы его можно было
  подключить к такому job позднее без изменения runtime-пакета.

Никакие MCP/debug props, зависимости или служебные exports не должны добавляться
в `packages/ui`.
