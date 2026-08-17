import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Dialog } from "../Dialog/Dialog";
import { Notification } from "./Notification";
import { NotificationProvider } from "./NotificationProvider";
import { notify } from "./notify";

const meta = {
  title: "Components/Notification",
  component: Notification,
  tags: ["autodocs"],
  args: { title: "Уведомление" },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <NotificationProvider containerLabel="Уведомления" />
        <Story />
      </DesignSystemProvider>
    )
  ]
} satisfies Meta<typeof Notification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesignerReference: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)", inlineSize: "320px" }}>
      <Notification closeButton={false} description="Изменения успешно применены" title="Настройки сохранены" variant="success" />
      <Notification closeButton={false} description="Проверьте подключение и повторите попытку" title="Не удалось сохранить" variant="error" />
      <Notification closeButton={false} description="Черновик будет удалён через 24 часа" title="Требуется внимание" variant="warning" />
      <Notification closeButton={false} description="Доступна новая версия приложения" title="Обновление" variant="info" />
      <Notification closeButton={false} description="Файл добавлен в очередь" title="Уведомление" variant="neutral" />
    </div>
  )
};

export const ImperativeQueue: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
      <Button onClick={() => notify.success({ title: "Настройки сохранены", description: "Изменения успешно применены" })} variant="secondary">Success</Button>
      <Button onClick={() => notify.error({ title: "Не удалось сохранить", description: "Попробуйте ещё раз", action: { label: "Повторить", onClick: () => undefined } })} variant="secondary">Error</Button>
      <Button onClick={() => notify.warning({ title: "Требуется внимание" })} variant="secondary">Warning</Button>
      <Button onClick={() => notify.info({ title: "Доступно обновление" })} variant="secondary">Info</Button>
    </div>
  ),
  play: async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Success" }));
    const notification = await page.findByRole("status");
    expect(notification).toHaveTextContent("Настройки сохранены");
    expect(notification.getBoundingClientRect().width).toBe(320);
    const toaster = notification.closest("[data-sonner-toaster]");
    expect(toaster).not.toBeNull();
    if (toaster) expect(window.getComputedStyle(toaster).zIndex).toBe("600");
  }
};

function DedupeFixture() {
  const [count, setCount] = useState(0);
  return (
    <Button onClick={() => {
      const next = count + 1;
      setCount(next);
      notify.info({ duration: 10_000, id: "sync", title: `Синхронизация ${next}` });
    }} variant="secondary">Обновить одно уведомление</Button>
  );
}

export const DeduplicateById: Story = {
  render: () => <DedupeFixture />,
  play: async () => {
    const page = within(document.body);
    const trigger = page.getByRole("button", { name: "Обновить одно уведомление" });
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    await waitFor(() => {
      const syncNotifications = page
        .getAllByRole("status")
        .filter((notification) => notification.textContent?.includes("Синхронизация"));
      expect(syncNotifications).toHaveLength(1);
      expect(syncNotifications[0]).toHaveTextContent("Синхронизация 2");
    });
  }
};

function ModalFixture() {
  const [open, setOpen] = useState(true);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog closeLabel="Закрыть диалог" initialFocusRef={initialFocusRef} onOpenChange={setOpen} open={open} title="Редактирование заказа">
      <Button onClick={() => notify.error({ title: "Заказ не сохранён", description: "Исправьте ошибки и повторите" })} ref={initialFocusRef} variant="primary">
        Сохранить
      </Button>
    </Dialog>
  );
}

export const AboveModalAndAccessible: Story = {
  render: () => <ModalFixture />,
  play: async () => {
    const page = within(document.body);
    const trigger = await page.findByRole("button", { name: "Сохранить" });
    await userEvent.click(trigger);
    const alert = await page.findByRole("alert");
    expect(alert).toHaveTextContent("Заказ не сохранён");
    expect(alert.closest("[aria-hidden=true]")).toBeNull();
    expect(trigger).toHaveFocus();
  }
};

export const DarkMode: Story = {
  render: () => (
    <DesignSystemProvider mode="dark">
      <div style={{ padding: "var(--ds-space-4)" }}>
        <Notification closeButton={false} description="Тёмная тема использует те же semantic status roles" title="Настройки сохранены" variant="success" />
      </div>
    </DesignSystemProvider>
  )
};
