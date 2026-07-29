import { Amount } from "@mypoint/ui/amount";
import { AmountInput } from "@mypoint/ui/amount-input";
import { Button as SubpathButton } from "@mypoint/ui/button";
import { ButtonLink } from "@mypoint/ui/button-link";
import { IconButton } from "@mypoint/ui/icon-button";
import { Spinner } from "@mypoint/ui/spinner";
import { Button, LinkButton, ThemeProvider } from "@mypoint/ui";
import { NumberInput } from "@mypoint/ui/number-input";
import { QuantityInput } from "@mypoint/retail-ui/quantity-input";
import "@mypoint/retail-ui/styles.css";
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
      <NumberInput aria-label="Number" value={1.25} />
      <QuantityInput
        aria-label="Quantity"
        decreaseLabel="Decrease quantity"
        increaseLabel="Increase quantity"
        min={1}
        value={2}
      />
    </ThemeProvider>
  );
}
