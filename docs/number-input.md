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
  Три знака после разделителя — текущая DS-политика для веса, объёма и
  fractional quantity; это не требование JavaScript или Intl.
- `allowNegative={false}` запрещает ввод и вставку отрицательных значений, но
  не переписывает отрицательное controlled-значение молча.
- `onChange` возвращает семантическое значение и текущую локализованную
  DOM-строку в `meta.inputValue`.
- `type="text"` и `inputMode="decimal"` используются для дробных значений;
  integer-only режим использует `inputMode="numeric"`.

## Controlled contract и accessibility

При переданном `value` prop является авторитетным семантическим состоянием.
Controlled consumer должен синхронно отразить локальный `onChange` в `value`.
Можно debounce-ить сохранение на сервере, но не локальное controlled-обновление.

`aria-valuenow` вычисляется из текущей отображаемой и успешно разобранной
editing-строки, поэтому assistive technology описывает видимое состояние поля.
При соблюдении controlled contract оно совпадает с `value`. Пустая или
промежуточная строка не получает `aria-valuenow`. Если controlled consumer
отклоняет изменение, поле возвращается к авторитетному `value`, и
`aria-valuenow` возвращается вместе с видимым значением.

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

Связанные композиции используют типизированный `stepActionsRef` с методами
`increment()` и `decrement()`. Это узкая composition-capability самого
`NumberInput`: она вызывает тот же путь, что и клавиатура, и не экспортирует
низкоуровневую арифметику. Основной ref остаётся `HTMLInputElement` и сохраняет
focus, selection и нативную интеграцию с формой. DOM `CustomEvent` для stepping
не используется.

`minimumFractionDigits` применяется при commit/blur и внешнем форматировании,
но не заставляет показывать завершающие нули во время свободного ввода:
`1.2` остаётся `1.2`, а после blur при `minimumFractionDigits={2}` становится
`1.20` с разделителем выбранной locale.

Disabled и read-only поля не изменяются с клавиатуры. Нативные атрибуты формы,
`name`, ref и события фокуса сохраняются через `Input`. При обычной отправке
формы браузер сериализует локализованную DOM-строку; если backend ожидает
каноническое число, приложение должно сериализовать семантическое значение
отдельно.

Например, `name="weight"` при `locale="ru-RU"` и видимом `1 234,5` добавит в
`FormData` именно локализованный текст `1 234,5`, а не JS-число `1234.5`.
Скрытое canonical-поле намеренно не добавляется. Отложенные варианты интеграции:
form adapter над `value/onChange`, hidden canonical field, serialization
callback или адаптер конкретной form-library.

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
