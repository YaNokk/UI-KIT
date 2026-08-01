import { Amount } from "@mypoint/ui/amount";
import { AmountInput } from "@mypoint/ui/amount-input";
import { Badge } from "@mypoint/ui/badge";
import { Button as SubpathButton } from "@mypoint/ui/button";
import { ButtonLink } from "@mypoint/ui/button-link";
import { Checkbox } from "@mypoint/ui/checkbox";
import { CheckboxGroup } from "@mypoint/ui/checkbox-group";
import { IconButton } from "@mypoint/ui/icon-button";
import { Spinner } from "@mypoint/ui/spinner";
import { StatusIndicator } from "@mypoint/ui/status-indicator";
import { Tag } from "@mypoint/ui/tag";
import type { SystemColor } from "@mypoint/ui/system-color";
import { Button, LinkButton, ThemeProvider } from "@mypoint/ui";
import { NumberInput } from "@mypoint/ui/number-input";
import { Radio } from "@mypoint/ui/radio";
import { RadioGroup } from "@mypoint/ui/radio-group";
import { Switch } from "@mypoint/ui/switch";
import { QuantityInput } from "@mypoint/retail-ui/quantity-input";
import "@mypoint/retail-ui/styles.css";
import { RefreshCw } from "lucide-react";

export function App() {
  const statusColor: SystemColor = "green";

  return (
    <ThemeProvider
      brand={{ accentColor: "#0080ff", foregroundColor: "#ffffff" }}
      mode="light"
    >
      <Button variant="primary">Сохранить</Button>
      <SubpathButton variant="soft">Подробнее</SubpathButton>
      <ButtonLink href="/orders" variant="secondary">Заказы</ButtonLink>
      <Checkbox label="Получать новости" />
      <CheckboxGroup
        label="Каналы"
        name="channels"
        options={[{ label: "Email", value: "email" }]}
      />
      <Radio label="Ежедневно" name="frequency-standalone" value="daily" />
      <RadioGroup
        label="Частота"
        name="frequency"
        options={[{ label: "Ежедневно", value: "daily" }]}
      />
      <Switch label="Автосохранение" />
      <LinkButton>Повторить</LinkButton>
      <IconButton aria-label="Обновить" icon={<RefreshCw />} />
      <Spinner label="Загрузка заказов" tone="accent" />
      <StatusIndicator color={statusColor} label="Сервис доступен" />
      <Tag color={statusColor} dot>Выполнен</Tag>
      <Badge color="red" label="3 непрочитанных уведомления">{3}</Badge>
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
