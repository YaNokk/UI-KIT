import { Amount } from "@mypoint/ui/amount";
import { Alert } from "@mypoint/ui/alert";
import { AmountInput } from "@mypoint/ui/amount-input";
import { Badge } from "@mypoint/ui/badge";
import { Button as SubpathButton } from "@mypoint/ui/button";
import { ButtonLink } from "@mypoint/ui/button-link";
import { Checkbox } from "@mypoint/ui/checkbox";
import { CheckboxGroup } from "@mypoint/ui/checkbox-group";
import { IconButton } from "@mypoint/ui/icon-button";
import { InternationalPhoneInput } from "@mypoint/ui/international-phone-input";
import { Spinner } from "@mypoint/ui/spinner";
import { Sidebar } from "@mypoint/ui/sidebar";
import { StatusIndicator } from "@mypoint/ui/status-indicator";
import { Tag } from "@mypoint/ui/tag";
import { Textarea } from "@mypoint/ui/textarea";
import type { SystemColor } from "@mypoint/ui/system-color";
import { Button, LinkButton, ThemeProvider } from "@mypoint/ui";
import { DateInput } from "@mypoint/ui/date-input";
import { TimeInput } from "@mypoint/ui/time-input";
import { DateTimeInput } from "@mypoint/ui/date-time-input";
import { DateTimePicker } from "@mypoint/ui/date-time-picker";
import { DatePicker } from "@mypoint/ui/date-picker";
import { DateRangeInput } from "@mypoint/ui/date-range-input";
import { DateRangePicker } from "@mypoint/ui/date-range-picker";
import { DateTimeRangeInput } from "@mypoint/ui/date-time-range-input";
import { DateTimeRangePicker } from "@mypoint/ui/date-time-range-picker";
import { NumberInput } from "@mypoint/ui/number-input";
import { NotificationProvider, notify } from "@mypoint/ui/notification";
import { Drawer } from "@mypoint/ui/drawer";
import { ActionMenu } from "@mypoint/ui/action-menu";
import { ModalFooterActions } from "@mypoint/ui/modal-footer";
import { ModalHeaderActions } from "@mypoint/ui/modal-header";
import { Radio } from "@mypoint/ui/radio";
import { RadioGroup } from "@mypoint/ui/radio-group";
import { Switch } from "@mypoint/ui/switch";
import { QuantityInput } from "@mypoint/retail-ui/quantity-input";
import "@mypoint/retail-ui/styles.css";
import { ChevronLeft, RefreshCw } from "lucide-react";

export function App() {
  const statusColor: SystemColor = "green";

  return (
    <ThemeProvider
      brand={{ accentColor: "#0080ff", foregroundColor: "#ffffff" }}
      mode="light"
    >
      <NotificationProvider />
      <ActionMenu
        actions={[{ id: "copy", label: "Copy", onSelect: () => undefined }]}
        trigger={<SubpathButton variant="secondary">Actions</SubpathButton>}
      />
      <Drawer
        closeLabel="Close package Drawer"
        footer={<ModalFooterActions primary={<SubpathButton variant="primary">Save</SubpathButton>} />}
        headerActions={<ModalHeaderActions actions={[{ id: "copy", label: "Copy", onSelect: () => undefined }]} />}
        headerLeading={<IconButton aria-label="Back" icon={<ChevronLeft />} />}
        onOpenChange={() => undefined}
        open={false}
        size="lg"
        title="Package Drawer"
      >
        Drawer package smoke test
      </Drawer>
      <Alert title="Package smoke test" variant="info">Alert subpath resolves.</Alert>
      <Button onClick={() => notify.success({ title: "Package smoke test" })} variant="secondary">Notify</Button>
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
      <Sidebar aria-label="Package subpath smoke test" />
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
      <InternationalPhoneInput defaultCountry="PL" label="Phone" />
      <Textarea label="Notes" showCount maxLength={200} />
      <DateInput label="Date" value="2026-08-02" />
      <TimeInput label="Time" value="10:15" />
      <DateTimeInput label="Date and time" value="2026-08-02T10:15" />
      <DateTimePicker label="Pick date and time" value="2026-08-02T10:15" />
      <DatePicker label="Pick date" value="2026-08-02" />
      <DateRangeInput label="Date range" value={{ from: "2026-08-01", to: "2026-08-02" }} />
      <DateRangePicker label="Pick range" value={{ from: "2026-08-01", to: "2026-08-02" }} />
      <DateTimeRangeInput label="Date time range" value={{ from: "2026-08-01T09:00", to: "2026-08-02T18:00" }} />
      <DateTimeRangePicker label="Pick date time range" timeZone="Europe/Warsaw" value={{ from: "2026-08-01T09:00", to: "2026-08-02T18:00" }} />
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
