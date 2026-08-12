# Scrollbar visual foundation

`scrollbarClassName()` — opt-in visual recipe для уже существующего владельца
прокрутки. Она не задаёт `overflow`, размеры контейнера, направление прокрутки
или scroll behavior.

## API

- `scrollbarClassName()` — стандартная толщина для основных scroll surfaces.
- `scrollbarClassName("compact")` — компактная толщина для плотных областей.
- Оба варианта поддерживают вертикальную и горизонтальную прокрутку.

Цвет thumb задаётся semantic tokens `scrollbar.thumb` и
`scrollbar.thumbHover`, геометрия — `size.scrollbar.*` и `radius.full`.
Scrollbar не зависит от runtime brand. В light/dark меняются semantic aliases;
в forced-colors управление цветом возвращается браузеру.

## Использование

```tsx
import { scrollbarClassName } from "@mypoint/ui";

<div className={scrollbarClassName()} style={{ overflow: "auto" }}>
  {content}
</div>
```

Consumer по-прежнему подключает `@mypoint/ui/styles.css`. Recipe применяется
только к настоящему scroll owner. Вложенному контенту или внешней обёртке класс
не передаётся вместо scroll owner.

## Встроенные владельцы

Стандартный вариант используется в Sidebar content, Table scroll container,
Popover surface, Select listbox (включая виртуализированный owner) и modal body.
Компоненты продолжают самостоятельно владеть своей overflow-геометрией.
