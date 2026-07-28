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
`@mypoint/ui/link`.

Forms и overlay foundations доступны как `Portal`/`PortalProvider`,
`FormControl`, `FieldShell`, `Input` и `PasswordInput` с явными subpaths
`portal`, `form-control`, `field-shell`, `input` и `password-input`.
`FormControl` владеет label/helper/error semantics, а публичный advanced
primitive `FieldShell` — общей геометрией input-like controls. Specialized
fields композируют эти foundations и не копируют Input styles.

Generic icons импортируются статически из `lucide-react`. Компонент,
владеющий icon-slot, задаёт размер, цвет через `currentColor` и decorative
a11y treatment; см. `../../docs/icons-and-assets.md`.
