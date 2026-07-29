# QuantityInput

`QuantityInput` — retail-композиция из `@mypoint/retail-ui`:

```text
IconButton −  NumberInput  IconButton +
```

```tsx
import { QuantityInput } from "@mypoint/retail-ui/quantity-input";

<QuantityInput
  aria-label="Количество товара"
  decreaseLabel="Уменьшить количество"
  increaseLabel="Увеличить количество"
  min={1}
  max={20}
  value={quantity}
  onChange={setQuantity}
/>;
```

Кнопки являются соседними action-элементами, а не adornments поля. Для иконок
используются статические named imports `Minus` и `Plus` из Lucide. Все три
контрола имеют canonical `sm`-высоту 32 px; вариант `xs`/28 px не вводится.
Центрирование текста — локальная composition-стилизация и не меняет обычное
выравнивание `NumberInput`.

## Поведение

- `min` опционален, `step` по умолчанию равен `1`,
  `maximumFractionDigits` — `0`. Для обычной корзины рекомендуется `min={1}`.
- Кнопка disabled всегда, когда соответствующий шаг недоступен: на достигнутой
  границе, при unsafe scaled arithmetic, а также в `disabled`/`readOnly`.
  Availability берётся из того же evaluator, что выполняет шаг, поэтому
  визуальное состояние не расходится с keyboard/actions behavior.
- Кнопки и стрелки клавиатуры активируют один step engine из `NumberInput`;
  отдельной retail-арифметики нет. Композиция вызывает поддерживаемые
  типизированные `NumberInputActions.increment()`/`decrement()` через
  `actionsRef`; DOM events и private imports из `packages/ui/src/internal`
  не используются. Native input ref остаётся отдельным контрактом.
- После клика фокус остаётся на активированной кнопке. Press-and-hold в v1 не
  поддерживается.
- Пустое значение разрешено во время редактирования. На blur оно
  восстанавливается до `min`, если `min` задан; без `min` остаётся `null`.
- Порядок blur намеренный: сначала `NumberInput` commit/clamp-ит editing value,
  затем вызывает consumer `onBlur`, после чего `QuantityInput` применяет
  retail-правило `null → min`.
- `role="group"` связывает поле и две sibling-кнопки в один quantity control;
  группа и каждая icon-only кнопка получают явные accessible names. Имя группы
  описывает весь контрол, а `increaseLabel`/`decreaseLabel` — отдельные actions.

`QuantityInput` не вводит отдельную form serialization. `name` принадлежит
видимому `NumberInput`, поэтому нативная форма отправляет локализованный текст.
Для canonical quantity продуктовый form adapter должен читать семантические
`value/onChange`. Кнопки имеют `type="button"` и не отправляют форму.

Зависимость пакета направлена только через публичный `@mypoint/ui`. React и
ReactDOM остаются peer dependencies, private UI internals не импортируются.

Композиция сохраняет одинаковую intrinsic-геометрию на narrow/mobile, tablet и
desktop. На узкой поверхности средняя колонка может сжиматься, но порядок,
32 px hit areas и keyboard tab order не меняются. В продуктовой раскладке
внешний контейнер решает, располагать описание товара и quantity control в
строку или в столбец.

Из Core DS адаптированы boundary availability, keyboard/button parity и
доступные step-действия. Встроенный stepper внутри поля отклонён: retail
кнопки остаются самостоятельными siblings. MP UI KIT повлиял только на compact
density и визуальную иерархию; токены и компоненты проекта имеют приоритет.

Контракты `QuantityInput` и `QuantityInputProps` после этого прохода считаются
замороженными для v1. Дальнейшее изменение требует продуктового сценария,
исправления ошибки, accessibility-требования или изменения semantic value
model.
