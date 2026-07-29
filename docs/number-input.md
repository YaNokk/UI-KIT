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

Связанные DS/domain-композиции используют advanced API `actionsRef` типа
`React.Ref<NumberInputActions>` с методами `increment()` и `decrement()`.
Обычному controlled consumer этот API не нужен: стандартный путь остаётся
`value`/`onChange`. Actions вызывают тот же путь, что и клавиатура, и не
экспортируют низкоуровневую арифметику. Основной ref остаётся
`HTMLInputElement` и отдельно сохраняет focus, selection и нативную интеграцию
с формой. DOM `CustomEvent` для stepping не используется.

Integer-scaled stepping поддерживается только пока `value`, `step`, `min` и
`max`, умноженные на вычисленный decimal scale, а также итоговая операция
остаются в пределах `Number.MAX_SAFE_INTEGER`. Внутренний предел precision и
scale является safety-деталью реализации, а не публичным обещанием поддержки
конкретного количества дробных знаков. Если хотя бы одна часть выходит за
безопасный диапазон, действие детерминированно становится no-op и не вызывает
`onChange`; неточное значение не публикуется. Большое конечное `number` при
этом может оставаться доступным для отображения и парсинга, даже если stepping
для него недоступен. Неподдерживаемая конфигурация не округляется молча к
другому `step`.

`stepNumber` и `canStepNumber` используют один внутренний evaluator, который
одновременно вычисляет availability и итоговое значение. `canStepNumber`
доступен через `@mypoint/ui` только как capability для DS/domain-композиций;
сам evaluator, арифметика и safety-константы остаются private. Keyboard и
`actionsRef` используют тот же результат: unavailable step означает no-op без
`onChange`.

Экспоненциальная запись (`1e6`, `1E-3`) в интерактивном вводе v1 не
поддерживается. Поле принимает locale-aware десятичную запись. Строка с
незавершённым разделителем (`1,` в `ru-RU`) считается промежуточной:
`aria-valuenow` отсутствует и семантическое editing-значение равно `null`.
`role="spinbutton"` задан намеренно вместе с accessible name,
`aria-valuenow`, числовыми `aria-valuemin`/`aria-valuemax` и обработкой
ArrowUp/ArrowDown.

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

Произвольная decimal-библиотека намеренно не используется:
`number → Big/Decimal → number` всё равно завершает вычисление в IEEE-754 и не
решает locale parsing, caret или Maskito editing. Если продукту понадобится
точное end-to-end значение за пределами текущего диапазона, сначала нужно
пересмотреть публичный semantic type (например, на строковую decimal-модель),
а уже затем выбирать библиотеку и правила округления.

Контракты `NumberInput`, `NumberInputProps` и `NumberInputActions` после этого
прохода считаются замороженными для v1. Их изменение требует продуктового
сценария, исправления ошибки, accessibility-требования или пересмотра semantic
value model.

Из Core DS адаптированы controlled/uncontrolled модель, blur commit, границы и
клавиатурный step. Не перенесены responsive-wrapper, числовые размеры,
встроенные справа steppers, строковый value и Core-стили. MP UI KIT используется
только как ориентир плотности; каноническая геометрия остаётся геометрией
`FieldShell`.
