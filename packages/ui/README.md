# @mypoint/ui

ESM React-компоненты дизайн-системы MyPoint.

```tsx
import "@mypoint/ui/styles.css";
import { Button, ThemeProvider } from "@mypoint/ui";

export function App() {
  return (
    <ThemeProvider
      brand={{ accentColor: "#0080ff", foregroundColor: "#ffffff" }}
      mode="light"
    >
      <Button variant="primary">Сохранить</Button>
    </ThemeProvider>
  );
}
```

React и ReactDOM предоставляются consumer-приложением. Tailwind в consumer не
требуется.
