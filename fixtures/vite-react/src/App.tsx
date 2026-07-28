import { Button as SubpathButton } from "@mypoint/ui/button";
import { Button, ThemeProvider } from "@mypoint/ui";

export function App() {
  return (
    <ThemeProvider
      brand={{ accentColor: "#0080ff", foregroundColor: "#ffffff" }}
      mode="light"
    >
      <Button variant="primary">Сохранить</Button>
      <SubpathButton variant="soft">Подробнее</SubpathButton>
    </ThemeProvider>
  );
}
