import { Amount } from "@mypoint/ui/amount";
import { AmountInput } from "@mypoint/ui/amount-input";
import { Button as SubpathButton } from "@mypoint/ui/button";
import { ButtonLink } from "@mypoint/ui/button-link";
import { IconButton } from "@mypoint/ui/icon-button";
import { Spinner } from "@mypoint/ui/spinner";
import { Button, LinkButton, ThemeProvider } from "@mypoint/ui";
import { RefreshCw } from "lucide-react";

export function App() {
  return (
    <ThemeProvider
      brand={{ accentColor: "#0080ff", foregroundColor: "#ffffff" }}
      mode="light"
    >
      <Button variant="primary">Сохранить</Button>
      <SubpathButton variant="soft">Подробнее</SubpathButton>
      <ButtonLink href="/orders" variant="secondary">Заказы</ButtonLink>
      <LinkButton>Повторить</LinkButton>
      <IconButton aria-label="Обновить" icon={<RefreshCw />} />
      <Spinner label="Загрузка заказов" tone="accent" />
      <Amount currency="PLN" locale="pl-PL" value={123456} />
      <AmountInput
        currency="PLN"
        label="Сумма"
        locale="pl-PL"
        value={123456}
      />
    </ThemeProvider>
  );
}
