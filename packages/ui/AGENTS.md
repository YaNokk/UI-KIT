# UI Rules

- Проверяйте semantic tokens и существующий public API до реализации.
- Primitive colors и backend appearance не импортируются в компоненты.
- Запрещены raw color literals и arbitrary Tailwind values; lint проверяет это автоматически.
- Light/dark и brand реализуются через CSS variables, без ветвления component markup.
- Для каждого публичного компонента обязательны stories, keyboard/focus и a11y coverage.

