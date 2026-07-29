# NumberInput

`NumberInput` — generic numeric field из `@mypoint/ui`. Компонент переиспользует
`Input`/`FormControl`/`FieldShell` и общий Maskito-адаптер, но его публичное
значение всегда имеет тип `number | null`.

## API

```tsx
import { NumberInput } from "@mypoint/ui/number-input";

<NumberInput
  label="Вес"
  locale="ru-RU"
  min={0}
  max={100}
  step={0.25}
  maximumFractionDigits={2}
  value={weight}
  onChange={(value, { inputValue }) => setWeight(value)}
/>;
```

- `value`/`defaultValue`: семантическое `number | null`; пустая строка — `null`,
  а `0` остаётся самостоятельным значением.
- `locale`: явное значение имеет приоритет над ближайшим
  `DesignSystemProvider`; форматирование не выводит валюту или страну.
- `minimumFractionDigits` по умолчанию `0`, `maximumFractionDigits` — `3`.
- `allowNegative={false}` запрещает ввод и вставку отрицательных значений, но
  не переписывает отрицательное controlled-значение молча.
- `onChange` возвращает семантическое значение и текущую локализованную
  DOM-строку в `meta.inputValue`.
- `type="text"` и `inputMode="decimal"` используются для дробных значений;
  integer-only режим использует `inputMode="numeric"`.

## Редактирование и commit

Во время ввода значение может временно выходить за `min`/`max`. На blur оно
ограничивается ближайшей границей и форматируется заново. Промежуточный знак
минуса и пустая строка дают `null`; blur не подменяет generic `null` границей.

`ArrowUp` и `ArrowDown` используют один decimal-safe step engine. Точность
выводится из текущего значения, `step`, границ и `maximumFractionDigits`.
Дробный `step` с большей точностью, чем `maximumFractionDigits`, является
ошибкой конфигурации. Для `null` обе стрелки выбирают `min`, если он задан;
без `min` ArrowUp выбирает `step`, а ArrowDown — `-step` либо `0`, когда
отрицательные значения запрещены.

Disabled и read-only поля не изменяются с клавиатуры. Нативные атрибуты формы,
`name`, ref и события фокуса сохраняются через `Input`. При обычной отправке
формы браузер сериализует локализованную DOM-строку; если backend ожидает
каноническое число, приложение должно сериализовать семантическое значение
отдельно.

## Границы ответственности

`NumberInput` не зависит от `AmountInput` и не содержит финансовой арифметики.
Оба компонента являются sibling-компонентами над общим numeric editing
foundation. Публичный `NumberStepper` и внутренние step helpers не
экспортируются.

Из Core DS адаптированы controlled/uncontrolled модель, blur commit, границы и
клавиатурный step. Не перенесены responsive-wrapper, числовые размеры,
встроенные справа steppers, строковый value и Core-стили. MP UI KIT используется
только как ориентир плотности; каноническая геометрия остаётся геометрией
`FieldShell`.
