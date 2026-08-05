# @mypoint/ui

ESM React-компоненты дизайн-системы MyPoint.

Пакет не навязывает доставку шрифта. Базовый режим использует только стили:

```tsx
import "@mypoint/ui/styles.css";
```

Для точного визуального соответствия загрузите Inter 400/500/600 в
consumer-приложении или явно подключите опциональный entry перед основными
стилями:

```tsx
import "@mypoint/ui/fonts.css";
import "@mypoint/ui/styles.css";
```

Без одного из этих вариантов компоненты используют системный fallback из
token-driven стека `Inter, ui-sans-serif, system-ui, sans-serif`.

```tsx
import "@mypoint/ui/styles.css";
import {
  Badge,
  Button,
  ButtonLink,
  DesignSystemProvider,
  Heading,
  IconButton,
  Link,
  Spinner,
  StatusIndicator,
  Tag,
  Text,
} from "@mypoint/ui";
import { RefreshCw } from "lucide-react";

export function App() {
  return (
    <DesignSystemProvider
      brand={{ accentColor: "#0080ff", foregroundColor: "#ffffff" }}
      locale="ru-RU"
      mode="light"
    >
      <Heading level={1} variant="page">Заказы</Heading>
      <Text as="p" tone="secondary">Управление заказами</Text>
      <Link href="/orders">Открыть список</Link>
      <ButtonLink href="/orders/new" variant="secondary">Новый заказ</ButtonLink>
      <Button variant="primary">Создать заказ</Button>
      <IconButton aria-label="Обновить" icon={<RefreshCw />} />
      <Spinner label="Загрузка заказов" tone="accent" />
      <Tag color="green" dot>Выполнен</Tag>
      <Badge color="red" label="3 непрочитанных уведомления">{3}</Badge>
      <StatusIndicator color="green" label="Сервис доступен" />
    </DesignSystemProvider>
  );
}
```

For application roots, prefer `DesignSystemProvider`; it composes locale,
theme/brand and portal environment while remaining optional for isolated
component usage:

```tsx
<DesignSystemProvider locale="ru-RU" mode="system">
  <App />
</DesignSystemProvider>
```

`DesignSystemProvider` renders a real scoped DOM root and automatically keeps
normal Portal content inside that theme/brand scope. `ThemeProvider` remains a
public advanced primitive for local theme/brand-only scopes.

React и ReactDOM предоставляются consumer-приложением. Tailwind в consumer не
требуется.

Компоненты доступны через root named exports и явные ESM subpaths:
`@mypoint/ui/design-system-provider`, `@mypoint/ui/button`, `@mypoint/ui/button-link`,
`@mypoint/ui/icon-button`, `@mypoint/ui/spinner`, `@mypoint/ui/text`, `@mypoint/ui/heading` и
`@mypoint/ui/link`. System-color primitives доступны как `@mypoint/ui/tag`,
`@mypoint/ui/badge`, `@mypoint/ui/status-indicator`; общий закрытый тип — через
`@mypoint/ui/system-color`. Monetary-компоненты также доступны через
`@mypoint/ui/amount` и `@mypoint/ui/amount-input`.

Choice controls доступны через root exports и subpaths `checkbox`,
`checkbox-group`, `radio`, `radio-group` и `switch`. Они всегда сохраняют
нативный input в DOM; `CheckboxGroup` отправляет повторяющиеся values одного
`name`, а `Switch` использует native checkbox с `role="switch"`. Полный
контракт описан в `../../docs/choice-controls.md`.

Forms и overlay foundations доступны как `Portal`/`PortalProvider`,
`FormControl`, `FieldShell`, `Input` и `PasswordInput` с явными subpaths
`portal`, `form-control`, `field-shell`, `input` и `password-input`.
`FormControl` владеет label/helper/error semantics, а публичный advanced
primitive `FieldShell` — общей геометрией input-like controls. Specialized
fields композируют эти foundations и не копируют Input styles.

Controlled modal surfaces доступны как `Dialog`, `Drawer` и `BottomSheet`
через root exports и subpaths `dialog`, `drawer`, `bottom-sheet`. Они требуют
`open`, `onOpenChange` и `closeLabel`; Trigger/defaultOpen, raw z-index,
placement, snap points и Radix types не входят в публичный API. Общие
`ModalCloseReason` и `ModalOpenChangeMeta` доступны через root export и
`@mypoint/ui/modal`; runtime и layer types остаются private. Общие Portal,
focus, hierarchy, ancestor invalidation, layer arbitration и document scroll
lock описаны в `../../docs/modal-foundation.md`.

## Amount foundation

`Amount` и `AmountInput` используют безопасное целое значение в минорных
единицах. Например, `123456` при `minority={100}` означает `1234.56`.
Пустой `AmountInput` возвращает `null`, а `0` остаётся валидным значением.
Валюта, точность и расположение символа определяются через `Intl`; явный
`minority` имеет приоритет. Locale resolution: component override → shared
`DesignSystemProvider` → детерминированный fallback `en-US`.

Форматированная строка поля не является публичным semantic value и доступна
только как `meta.inputValue` в `onChange`. Maskito скрыт за внутренним numeric
adapter и не входит в публичные типы.

В `AmountInput` currency affix является фиксированной частью masked input value,
а не `FieldShell` adornment. Generic adornments остаются отдельными слотами.
`Amount` поддерживает canonical `typo-*` utilities через `className`; utility
переопределяет convenience preset `size`.

Currency, locale и minority независимы. Репозиторий пока не содержит
authoritative backend currency registry, поэтому UI использует Intl для любой
валидной валюты и не объявляет географический allow-list. Некорректный code
отображается буквально и не подменяется. Смена currency не выполняет FX.

Архитектурное разделение locale/currency/phone region описано в
`../../docs/formatting-foundation.md`, а runtime API provider — в
`../../docs/design-system-provider.md`.

Generic icons импортируются статически из `lucide-react`. Компонент,
владеющий icon-slot, задаёт размер, цвет через `currentColor` и decorative
a11y treatment; см. `../../docs/icons-and-assets.md`.
