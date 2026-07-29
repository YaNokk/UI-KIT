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
- Кнопка на достигнутой границе disabled. `disabled` и `readOnly` отключают обе
  кнопки, не меняя геометрию.
- Кнопки и стрелки клавиатуры активируют один step engine из `NumberInput`;
  отдельной retail-арифметики нет.
- После клика фокус остаётся на активированной кнопке. Press-and-hold в v1 не
  поддерживается.
- Пустое значение разрешено во время редактирования. На blur оно
  восстанавливается до `min`, если `min` задан; без `min` остаётся `null`.
- Группа и каждая icon-only кнопка получают явные accessible names.

Композиция сохраняет одинаковую intrinsic-геометрию на narrow/mobile, tablet и
desktop. На узкой поверхности средняя колонка может сжиматься, но порядок,
32 px hit areas и keyboard tab order не меняются. В продуктовой раскладке
внешний контейнер решает, располагать описание товара и quantity control в
строку или в столбец.

Из Core DS адаптированы boundary availability, keyboard/button parity и
доступные step-действия. Встроенный stepper внутри поля отклонён: retail
кнопки остаются самостоятельными siblings. MP UI KIT повлиял только на compact
density и визуальную иерархию; токены и компоненты проекта имеют приоритет.
