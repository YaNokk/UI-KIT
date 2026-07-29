# Prototype Designer Rules

`prototypes/` — основная зона экспериментов продуктового дизайнера и Codex.
Правила корневого `AGENTS.md` продолжают действовать, кроме явно разрешённых
ниже prototype-only исключений.

## Разрешено

- Быстро собирать продуктовые потоки и несколько UX-вариантов.
- Использовать fixtures, mock data и prototype-only компоненты.
- Временно применять hardcoded layout values и Tailwind arbitrary layout
  values, например `grid-cols-[1fr_auto]` или `gap-[18px]`.
- Создавать локальные domain compositions до определения стабильного
  production-контракта.

Эти исключения относятся только к layout внутри `prototypes/**`. Произвольные
brand/status colors, подмена semantic tokens и ослабление production lint
по-прежнему запрещены.

## Обязательный discovery

Перед созданием primitive-like control:

1. Проверьте публичные exports `packages/ui`, `packages/patterns`,
   `packages/retail-ui` и `packages/icons`, если соответствующий пакет есть.
2. Найдите существующие stories и contracts.
3. Используйте Storybook MCP, когда он доступен.
4. Подтвердите, что канонического эквивалента нет.

Storybook MCP остаётся dev-only инструментом и не создаёт runtime dependency,
public props или exports.

## Границы

- Production-код в `apps/**` и `packages/**` никогда не импортирует
  `prototypes/**`.
- Prototypes используют только public exports production-пакетов; deep imports
  разрешены только при явной политике пакета.
- Не создавайте shadow UI-KIT: `prototypes/shared/Button.tsx`,
  `Input.tsx`, `Select.tsx`, `Dialog.tsx`, `Modal.tsx` запрещены, когда есть
  канонический эквивалент.
- Не изменяйте `packages/tokens`, `packages/ui`, public API, runtime brand
  infrastructure, exports или build configuration как shortcut для prototype.
  Для этого создаётся отдельная DS-задача.
- Не кодируйте runtime brand identity напрямую, если существует semantic
  action/accent token; status colors от brand не зависят.
- Prototype stories публикуются только под `Prototypes/Cashier/...` или
  `Prototypes/Backoffice/...`, не под `Components/...`.
- Production packages не импортируют и не публикуют prototype source или
  prototype stories.

## Missing DS capability

Если primitive отсутствует, не создавайте фальшивый канонический компонент.
Используйте явно временное имя (`PrototypeTag`, `TagMock`), пометьте компонент
как prototype-only и запишите в README:

```text
Missing DS capability: Tag
```

Запрос на изменение `Input`, новый variant `Button`, новый token или новый
primitive оформляется отдельной DS-задачей. Prototype может продолжить работу с
явным placeholder.

## Качество prototype

- Называйте applied components по domain responsibility: `Receipt`,
  `OrderSummary`, `PaymentMethodPicker`, а не `BigCard`, `BlueBox`,
  `LeftPanel`, `CustomSelect` или `NewInput`.
- Для существенной feature ведите README по шаблону из `prototypes/README.md`.
- Покрывайте релевантные состояния: default, empty, loading, error, long
  content, narrow/mobile и desktop; при необходимости disabled, selected, many
  items и keyboard focus.
- Cashier проверяется для touch, tablet, compact desktop и narrow viewport.
  Backoffice — для desktop, tablet и narrow desktop.
- По возможности просматривайте default/alternate accent и light/dark.
- Не публикуйте prototype-only код и не переносите его в production простым
  перемещением файлов: promotion — отдельная задача нормализации.
