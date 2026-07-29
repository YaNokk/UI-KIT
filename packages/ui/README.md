# @mypoint/ui

ESM React-компоненты дизайн-системы MyPoint.

```tsx
import "@mypoint/ui/styles.css";
import {
  Button,
  ButtonLink,
  Heading,
  IconButton,
  Link,
  Spinner,
  Text,
  ThemeProvider
} from "@mypoint/ui";
import { RefreshCw } from "lucide-react";

export function App() {
  return (
    <ThemeProvider
      brand={{ accentColor: "#0080ff", foregroundColor: "#ffffff" }}
      mode="light"
    >
      <Heading level={1} variant="page">Заказы</Heading>
      <Text as="p" tone="secondary">Управление заказами</Text>
      <Link href="/orders">Открыть список</Link>
      <ButtonLink href="/orders/new" variant="secondary">Новый заказ</ButtonLink>
      <Button variant="primary">Создать заказ</Button>
      <IconButton aria-label="Обновить" icon={<RefreshCw />} />
      <Spinner label="Загрузка заказов" tone="accent" />
    </ThemeProvider>
  );
}
```

React и ReactDOM предоставляются consumer-приложением. Tailwind в consumer не
требуется.

Компоненты доступны через root named exports и явные ESM subpaths:
`@mypoint/ui/button`, `@mypoint/ui/button-link`,
`@mypoint/ui/icon-button`, `@mypoint/ui/spinner`, `@mypoint/ui/text`, `@mypoint/ui/heading` и
`@mypoint/ui/link`. Monetary-компоненты также доступны через
`@mypoint/ui/amount` и `@mypoint/ui/amount-input`.

Forms и overlay foundations доступны как `Portal`/`PortalProvider`,
`FormControl`, `FieldShell`, `Input` и `PasswordInput` с явными subpaths
`portal`, `form-control`, `field-shell`, `input` и `password-input`.
`FormControl` владеет label/helper/error semantics, а публичный advanced
primitive `FieldShell` — общей геометрией input-like controls. Specialized
fields композируют эти foundations и не копируют Input styles.

## Amount foundation

`Amount` и `AmountInput` используют безопасное целое значение в минорных
единицах. Например, `123456` при `minority={100}` означает `1234.56`.
Пустой `AmountInput` возвращает `null`, а `0` остаётся валидным значением.
Валюта, точность и расположение символа определяются через `Intl`; явный
`minority` имеет приоритет. Locale resolution: component override → shared
application/DS boundary → детерминированный fallback `en-US`.

Форматированная строка поля не является публичным semantic value и доступна
только как `meta.inputValue` в `onChange`. Maskito скрыт за внутренним numeric
adapter и не входит в публичные типы.

В `AmountInput` currency affix является фиксированной частью masked input value,
а не `FieldShell` adornment. Generic adornments остаются отдельными слотами.
`Amount` поддерживает canonical `typo-*` utilities через `className`; utility
переопределяет convenience preset `size`.

Generic icons импортируются статически из `lucide-react`. Компонент,
владеющий icon-slot, задаёт размер, цвет через `currentColor` и decorative
a11y treatment; см. `../../docs/icons-and-assets.md`.
