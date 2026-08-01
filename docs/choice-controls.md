# Choice controls

`Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` и `Switch` образуют одну визуальную семью, но сохраняют разные нативные семантики. Архитектурный источник истины — текущие токены, runtime brand, typography, motion и accessibility-контракты `@mypoint/ui`. MP UI KIT используется только для визуальной калибровки, Core DS — для behavioral/API-аудита.

## Когда какой компонент использовать

- `Checkbox` — независимый boolean или пункт множественного выбора, результат которого обычно отправляется вместе с формой.
- `CheckboxGroup` — набор строковых значений с повторяющимися нативными checkbox и общим `name`.
- `RadioGroup` — обязательная композиция для выбора одного значения. Standalone `Radio` нужен только для ручной нативной композиции с общим `name`.
- `Switch` — настройка с немедленным эффектом. Он использует `input[type=checkbox]` с `role="switch"`, а не button с `aria-pressed`.

Нативный input всегда остаётся в DOM, получает focus/ref, сохраняет клавиатурную семантику и участвует в отправке формы. Визуальный indicator декоративен и не создаёт отдельную focus stop.

## Контракты и геометрия

Размеры `sm` и `md` семантические. Checkbox/Radio используют canonical `size.icon.md` (20 px) и `size.icon.lg` (24 px). Switch использует пары `size.control.sm × size.icon.md` и `size.control.md × size.icon.lg`. Numeric size props отсутствуют.

`position="start|end"` определяет сторону indicator. По умолчанию Checkbox/Radio используют `start`, Switch — `end`. `align="start|center"` по умолчанию равен `start`, поэтому indicator выравнивается по первой строке, а не по центру label/description stack. Горизонтальные группы естественно переносятся на narrow/mobile, tablet и desktop; их семантика не меняется. `block` растягивает control или fieldset, но не создаёт равные по ширине horizontal options.

Disabled реализован нативным `disabled`. `readOnly` намеренно отсутствует: checkbox/radio не имеют нативной readonly-семантики.

## Описания, ошибки и объявления

Standalone Checkbox и Switch связывают видимое `description` или `error` со своим input через `aria-describedby`. `error` заменяет `description` и выставляет `aria-invalid`. Consumer-provided `aria-describedby` сохраняется и объединяется с id сообщения.

Standalone Radio связывает собственное `description` со своим input. В `RadioGroup` описание каждой option принадлежит только соответствующему radio, тогда как group description/error принадлежит `fieldset`. Group error выставляет `aria-invalid` только на `fieldset`: дочерние Checkbox/Radio и их indicators сохраняют обычные selected/unselected visuals.

Статическая или уже присутствующая при первом рендере ошибка используется через `aria-describedby`. Компоненты v1 не добавляют `role="alert"` автоматически. Объявление динамически появившейся ошибки — ответственность form/application layer, который владеет моментом валидации и общей live-region policy.

## Состояние и формы

Standalone controls поддерживают controlled `checked` и uncontrolled `defaultChecked`. Callback единообразен: `onChange(checked, event)`. Public ref указывает на input. В uncontrolled-режиме нативный input является источником visual state для checkmark, radio dot и switch thumb.

`Checkbox.indeterminate` выставляет DOM property `input.indeterminate`. Это визуальная/state metadata с приоритетом над checked presentation; HTML-форма её не отправляет.

`CheckboxGroup` сохраняет порядок options, не выдаёт duplicates и отправляет выбранные values как повторяющиеся записи одного `name`. Group `required` показывает required-marker и остаётся metadata для consumer validation: native `required` не применяется к каждому checkbox, а невалидный для `fieldset` атрибут `aria-required` не выставляется.

`RadioGroup` генерирует одно стабильное `name`, если consumer его не передал. `required` применяется к каждому enabled radio с общим именем и сохраняет нативную radio-group validation semantics.

Нативная отправка standalone controls не дополняется hidden inputs:

- checked Checkbox и on Switch отправляют заданный `name/value`;
- unchecked Checkbox и off Switch отсутствуют в `FormData`;
- без явного `value` checked Checkbox/Switch отправляют browser default `"on"`;
- standalone Radio с общим `name` отправляют одно выбранное значение.

Controlled groups только вычисляют и передают следующее значение в callback; DOM отражает его после rerender с новым `value`. Uncontrolled groups обновляют собственное состояние.

## Цвет, тема и motion

Новые tokens не добавлялись: существующих semantic roles достаточно. Unchecked state использует `control.background`, `control.border` и `control.borderHover`; checked/on — contrast-safe `action.primary.*`; disabled — `control.backgroundDisabled`, `border.subtle`, `text.disabled` и `icon.disabled`; group invalid — `border.danger`/`text.danger` на уровне сообщения; focus — canonical `focus.*`.

On-track Switch использует `action.primary.background`, а thumb — `action.primary.foreground`. Поэтому default blue, bright yellow, light green и dark runtime brands получают ту же contrast-safe пару, что и Primary Button. Disabled checked Switch переопределяет оба значения disabled semantic roles. Никакие white/black literals не используются.

Runtime brand влияет только на checked/on и документированную focus-семантику. Error, disabled, neutral geometry и responsive behavior от brand не зависят. State/indicator transitions используют `motion.control.state` и `motion.control.indicator`; reduced motion сохраняет конечное состояние без локальных duration/easing.

## MultiSelect

Private `ChoiceIndicator kind="checkbox"` допускает будущую визуальную переиспользуемость внутри `role="option"`. Он остаётся `aria-hidden`, не содержит input/checkbox role и не создаёт nested interaction. В v1 интеграция с MultiSelect не выполнялась, чтобы не менять замороженный Select/MultiSelect contract.

## Audit decision table

| Concern | MP UI KIT | Core behavior | Existing foundation | Decision |
| --- | --- | --- | --- | --- |
| Geometry | compact 18 px indicators, 40×24 switch | semantic variants | 20/24 icon и 32/40 control sizes | normalize to canonical sm/md sizes |
| Checked color | blue accent | selected semantic state | runtime contrast-safe `action.primary.*` | consume action aliases, no raw color |
| Radio descriptions | supporting option text | per-control description association | stable generated IDs and merged ARIA IDs | per-option `aria-describedby`; group message stays on fieldset |
| Switch thumb contrast | light thumb | checked foreground must contrast | `action.primary.background/foreground` pair | on thumb uses `action.primary.foreground` |
| Group invalid visuals | group-level message | error ownership at group boundary | native `fieldset` association | error and invalid visuals are fieldset-owned only |
| Native semantics | decorative div/button in reference | native input expectations | project semantic HTML baseline | native input always present and focused |
| Typography | 14 px label | label + supporting text | `typography.body` / `body-sm` | reuse canonical roles |
| Motion | local transitions | visible state changes | `motion.control.*` | use existing roles |
| High contrast | not specified | state must remain perceivable | forced-colors policy | border/outline and system-color fallback |

Raw files under `references/raw` remain read-only and are not imported by production packages.
