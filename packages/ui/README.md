# @mypoint/ui

ESM React-компоненты дизайн-системы MyPoint.

```tsx
import "@mypoint/ui/styles.css";
import { Button, Heading, Link, Text, ThemeProvider } from "@mypoint/ui";

export function App() {
  return (
    <ThemeProvider
      brand={{ accentColor: "#0080ff", foregroundColor: "#ffffff" }}
      mode="light"
    >
      <Heading level={1} variant="page">Заказы</Heading>
      <Text as="p" tone="secondary">Управление заказами</Text>
      <Link href="/orders">Открыть список</Link>
      <Button variant="primary">Создать заказ</Button>
    </ThemeProvider>
  );
}
```

React и ReactDOM предоставляются consumer-приложением. Tailwind в consumer не
требуется.

Компоненты доступны через root named exports и явные ESM subpaths:
`@mypoint/ui/button`, `@mypoint/ui/text`, `@mypoint/ui/heading` и
`@mypoint/ui/link`.

Generic icons импортируются статически из `lucide-react`. Компонент,
владеющий icon-slot, задаёт размер, цвет через `currentColor` и decorative
a11y treatment; см. `../../docs/icons-and-assets.md`.
