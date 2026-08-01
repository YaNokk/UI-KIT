# Choice controls

`Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` и `Switch` образуют одну визуальную семью, но сохраняют разные нативные semantics. Архитектурный источник истины — текущие tokens, runtime brand, typography, motion и accessibility-контракты `@mypoint/ui`; MP UI KIT используется только для визуальной калибровки, Core DS — только для behavioral/API-аудита.

## Когда какой компонент использовать

- `Checkbox` — независимый boolean или один пункт множественного выбора, результат которого обычно отправляется вместе с формой.
- `CheckboxGroup` — управляет набором строковых значений и рендерит повторяющиеся нативные checkbox с одним `name`.
- `RadioGroup` — обязательная композиция для одного выбора из набора. `Radio` отдельно нужен только при ручной нативной композиции с общим `name`.
- `Switch` — настройка с немедленным эффектом. Он использует `input[type=checkbox]` с `role="switch"`, а не button с `aria-pressed`.

Нативный input всегда остаётся в DOM, получает focus/ref, хранит keyboard semantics и участвует в отправке формы. Внешний indicator декоративен и не создаёт отдельную focus stop.

## Контракты

Размеры `sm` и `md` семантические. Checkbox/Radio используют canonical `size.icon.md` (20 px) и `size.icon.lg` (24 px). Switch использует пары `size.control.sm × size.icon.md` и `size.control.md × size.icon.lg`. Numeric size props отсутствуют.

`position="start|end"` определяет сторону indicator. Defaults: Checkbox/Radio — `start`, Switch — `end`. `align="start|center"` по умолчанию равен `start`, поэтому indicator выравнивается по первой строке, а не по центру label/description stack. Horizontal groups переносятся естественно; на narrow/mobile, tablet и desktop их semantics не меняются. `block` растягивает control или fieldset, но не создаёт равные по ширине horizontal options.

`error` заменяет `description`. Видимое сообщение получает стабильный id и объединяется с consumer `aria-describedby`; error выставляет `aria-invalid`. Standalone `Radio` не владеет error — он принадлежит `RadioGroup`.

Disabled реализован только нативным `disabled`. `readOnly` намеренно отсутствует: checkbox/radio не имеют нативной readonly-семантики.

## Состояние и формы

Standalone controls поддерживают controlled `checked` и uncontrolled `defaultChecked`. Callback единообразен: `onChange(checked, event)`. Public ref указывает на input.

`Checkbox.indeterminate` выставляет DOM property `input.indeterminate`; это визуальная/state metadata, она имеет приоритет над checked presentation и не отправляется HTML-формой.

`CheckboxGroup` сохраняет порядок options, не выдаёт duplicates и отправляет выбранные values как повторяющиеся записи одного `name`. Group `required` — visual/ARIA metadata для consumer validation: native `required` не применяется к каждому checkbox, поскольку это означало бы «выбрать каждый пункт».

`RadioGroup` генерирует один стабильный `name`, если consumer его не передал. `required` применяется к каждому enabled radio с общим именем — это сохраняет проверенную нативную radio-group validation semantics. Выбор отправляет ровно одно значение.

Checkbox и Switch без явного `value` сохраняют browser default `"on"`. Hidden inputs не добавляются.

## Цвет, тема и motion

Новые tokens не добавлялись: отсутствующей semantic role не обнаружено. Unchecked state выражается через `control.background`, `control.border` и `control.borderHover`; checked/on — через contrast-safe `action.primary.*`; disabled — через `control.backgroundDisabled`, `border.subtle`, `text.disabled` и `icon.disabled`; invalid — через `border.danger` и `text.danger`; focus — через canonical `focus.*`.

Это решение сохраняет light/dark aliases и ограничивает runtime brand только checked/on и focus semantics. Error, disabled, neutral geometry и responsive behavior от brand не зависят. State и indicator transitions используют `motion.control.state` и `motion.control.indicator`; reduced motion уже централизованно сводит duration к нулю, а CSS содержит безопасный fallback.

## MultiSelect

Private `ChoiceIndicator kind="checkbox"` допускает будущую визуальную переиспользуемость внутри `role="option"`. В таком случае он остаётся `aria-hidden`, не содержит input/checkbox role и не создаёт nested interaction. В v1 интеграция с `MultiSelect` не выполнялась, чтобы не менять замороженный Select/MultiSelect contract.

## Audit decision table

| Concern | MP UI KIT | Core behavior | Existing foundation | Decision |
| --- | --- | --- | --- | --- |
| Geometry | compact 18 px indicators, 40×24 switch | semantic variants | 20/24 icon and 32/40 control sizes | normalize to canonical sm/md sizes |
| Checked color | blue accent | selected semantic state | runtime contrast-safe `action.primary.*` | consume action aliases, no raw color |
| Native semantics | reference uses decorative div/button | native input expectations | project semantic HTML baseline | native input always present and focused |
| Typography | 14 px label | label + supporting text | `typography.body` / `body-sm` | reuse canonical roles |
| Motion | local transitions | visible state changes | `motion.control.*` | use existing roles |
| Groups | three-column demo | fieldset/value APIs | FormControl-style ID/error conventions | private native `ChoiceGroupField` |
| High contrast | not specified | state must remain perceivable | forced-colors policy | border/outline and system-color fallback |

Raw files under `references/raw` remain read-only and are not imported by production packages.
