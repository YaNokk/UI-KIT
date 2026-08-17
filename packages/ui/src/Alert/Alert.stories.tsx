import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Bell } from "lucide-react";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Dialog } from "../Dialog/Dialog";
import { Alert } from "./Alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: { layout: "padded" }
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Alert title="Информация">Контекстное сообщение внутри страницы.</Alert>
};

export const DesignerReference: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <Alert title="Настройки сохранены" variant="success">Изменения успешно применены.</Alert>
      <Alert title="Обновление" variant="info">Доступна новая версия приложения.</Alert>
      <Alert title="Требуется внимание" variant="warning">Срок действия лицензии истекает через 7 дней.</Alert>
      <Alert title="Не удалось сохранить" variant="error">Проверьте данные и повторите попытку.</Alert>
      <Alert title="Информация" variant="neutral">Файл добавлен в очередь обработки.</Alert>
    </div>
  )
};

export const TitleOnly: Story = {
  render: () => <Alert title="Настройки сохранены" variant="success" />
};

export const BodyOnly: Story = {
  render: () => <Alert variant="info">Доступна новая версия приложения.</Alert>
};

export const RichContent: Story = {
  render: () => (
    <Alert variant="error">
      С записью связано <strong>12 заказов</strong> и <strong>3 акции</strong>.
    </Alert>
  )
};

export const LongContent: Story = {
  render: () => (
    <Alert title="Предупреждение о синхронизации справочников" variant="warning">
      Изменения ещё обрабатываются. Дождитесь завершения операции перед закрытием страницы,
      чтобы значения, заявки и связанные предложения не потерялись.
    </Alert>
  )
};

export const CustomIcon: Story = {
  render: () => <Alert icon={<Bell />} title="Новое событие" variant="info">Появилось непрочитанное обновление.</Alert>
};

export const WithoutIcon: Story = {
  render: () => <Alert icon={false} title="Без иконки">Контекст остаётся доступным текстом.</Alert>
};

function DialogFixture() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog closeLabel="Закрыть" onOpenChange={setOpen} open={open} title="Удалить запись?">
      <Alert variant="error">
        С записью связано <strong>12 заказов</strong> и <strong>3 акции</strong>.
      </Alert>
    </Dialog>
  );
}

export const InsideDialog: Story = {
  render: () => <DialogFixture />,
  play: async () => {
    const page = within(document.body);
    const dialog = await page.findByRole("dialog", { name: "Удалить запись?" });
    const alert = dialog.querySelector("[data-alert]");
    expect(alert).not.toBeNull();
    expect(alert).not.toHaveAttribute("role");
  }
};

export const DarkMode: Story = {
  render: () => (
    <DesignSystemProvider mode="dark">
      <div style={{ display: "grid", gap: "var(--ds-space-3)", padding: "var(--ds-space-4)" }}>
        <Alert title="Настройки сохранены" variant="success">Изменения успешно применены.</Alert>
        <Alert title="Не удалось сохранить" variant="error">Повторите попытку.</Alert>
      </div>
    </DesignSystemProvider>
  )
};
