# Prototypes

`prototypes/` — каноническая experimental workspace продуктового дизайнера.
Здесь можно собирать реальные потоки на существующей дизайн-системе, проверять
responsive-состояния и фиксировать недостающие возможности DS без загрязнения
production packages.

## Структура

```text
prototypes/
  cashier/
    checkout/
    payments/
  backoffice/
    products/
    orders/
```

Feature может содержать:

```text
screens/
components/
fixtures/
stories/
```

Не создавайте пустые папки только ради схемы: для простой feature достаточно
минимально понятной структуры. Story title начинается с
`Prototypes/Cashier/...` или `Prototypes/Backoffice/...`.

## Имена

Компонент называется по ответственности в домене: `Receipt`, `OrderSummary`,
`PaymentMethodPicker`, `CustomerCard`, `ProductSearch`, `ShiftSummary`.
Визуальные имена вроде `BigCard`, `BlueBox`, `LeftPanel` не объясняют назначение.
Имена `CustomSelect` и `NewInput` обычно указывают на shadow UI-KIT.

## README существенной feature

```md
# <Feature>

## Goal

## Stories / states

## Prototype-only decisions

## Missing DS capabilities

## Candidates for promotion

## Known constraints
```

Полный процесс описан в:

- [`../docs/designer-codex-quickstart.md`](../docs/designer-codex-quickstart.md);
- [`../docs/designer-workflow.md`](../docs/designer-workflow.md);
- [`../docs/designer-production-pipeline.md`](../docs/designer-production-pipeline.md).
