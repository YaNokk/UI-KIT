# UI Rules

- Проверяйте semantic tokens и существующий public API до реализации.
- Primitive colors и backend appearance не импортируются в компоненты.
- Запрещены raw color literals и arbitrary Tailwind values; lint проверяет это автоматически.
- Light/dark и brand реализуются через CSS variables, без ветвления component markup.
- Для каждого публичного компонента обязательны stories, keyboard/focus и a11y coverage.
- Public exports указывают только на `dist`; React/ReactDOM не бандлятся.
- CSS package artifact должен быть готов к использованию без consumer Tailwind.
- Добавление subpath export требует packed-consumer и tree-shaking проверки.
- Floating label/value vertical geometry задаётся только shared FieldShell variables; `md` — основной calibration size.
- Native field control остаётся full-height, а adornments не меняют vertical baseline.
- Используйте logical block properties и canonical spacing tokens; проверяйте результат в Storybook/browser.
- Field interaction использует native input и `label/htmlFor` прежде shell JS; FieldShell не становится tabbable.
- `cursor:text` не заменяет DOM semantics; не маскируйте label/input boundaries через `pointer-events:none`.
- Decorative adornments могут делегировать focus, interactive adornments сохраняют собственные pointer/keyboard semantics.
- Не добавляйте product/domain logic в generic UI только потому, что она нужна prototype; оформляйте promotion отдельной задачей.
- `packages/ui` никогда не импортирует `prototypes/**`; promoted code получает нормализованный API, tokens, stories и tests.
