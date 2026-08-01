# Tag contract

`Tag` поддерживает ровно три взаимоисключающих режима: статический `span`,
selectable `button` с `aria-pressed` и removable `button`, у которого вся
площадь тега является одним removal control. В removable-режиме обязательна
явная accessible name `removeLabel`. `dot` композирует декоративный
`StatusIndicator`. Размеры `sm`/`md` стабильны на всех breakpoints; контейнер
может переносить или обрезать теги, но компонент не меняет DOM-семантику.
