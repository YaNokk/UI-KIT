import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Dialog } from "../Dialog/Dialog";
import { Notification } from "./Notification";
import { NotificationProvider } from "./NotificationProvider";
import { notify } from "./notify";

function NotificationStoryBoundary({ children }: { children: ReactNode }) {
  useEffect(() => {
    notify.dismiss();
    return () => notify.dismiss();
  }, []);
  return children;
}

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
        <NotificationStoryBoundary><Story /></NotificationStoryBoundary>
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
    const title = await page.findByText("Настройки сохранены", { exact: true });
    const notification = title.closest("[data-notification]");
    expect(notification).not.toBeNull();
    if (!(notification instanceof HTMLElement)) return;
    expect(notification).toHaveTextContent("Настройки сохранены");
    expect(notification.getBoundingClientRect().width).toBe(320);
    const toaster = notification.closest("[data-sonner-toaster]");
    expect(toaster).not.toBeNull();
    if (toaster) {
      expect(window.getComputedStyle(toaster).zIndex).toBe("600");
      expect(toaster.closest("[aria-live=polite], [aria-live=assertive]")).toBeNull();
      expect(toaster.closest("[aria-live=off]")).not.toBeNull();
    }
  }
};

const firstDedupeDismiss = fn();
const finalDedupeDismiss = fn();

function DedupeFixture() {
  return (
    <div style={{ display: "flex", gap: "var(--ds-space-3)" }}>
      <Button onClick={() => notify.info({
        description: "Подготовка данных",
        duration: 10_000,
        id: "sync",
        onDismiss: firstDedupeDismiss,
        title: "Синхронизация 1"
      })} variant="secondary">Создать уведомление</Button>
      <Button onClick={() => notify.error({
        description: "Повторите попытку",
        duration: 12_000,
        id: "sync",
        onDismiss: finalDedupeDismiss,
        title: "Синхронизация 2"
      })} variant="secondary">Обновить уведомление</Button>
    </div>
  );
}

export const DeduplicateById: Story = {
  render: () => <DedupeFixture />,
  play: async () => {
    firstDedupeDismiss.mockClear();
    finalDedupeDismiss.mockClear();
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Создать уведомление" }));
    await userEvent.click(page.getByRole("button", { name: "Обновить уведомление" }));
    await waitFor(() => {
      const syncNotifications = page
        .getAllByRole("alert")
        .filter((notification) => notification.textContent?.includes("Синхронизация"));
      expect(syncNotifications).toHaveLength(1);
      expect(syncNotifications[0]).toHaveTextContent("Синхронизация 2");
      expect(syncNotifications[0]).toHaveTextContent("Повторите попытку");
    });
    expect(firstDedupeDismiss).not.toHaveBeenCalled();
    notify.dismiss("sync");
    await waitFor(() => expect(finalDedupeDismiss).toHaveBeenCalledOnce());
    expect(firstDedupeDismiss).not.toHaveBeenCalled();
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

export const MobileSafeArea: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: () => (
    <Button onClick={() => notify.info({
      duration: 10_000,
      title: "Мобильное уведомление",
      description: "Поверхность использует доступную ширину и safe-area отступы."
    })} variant="secondary">Показать мобильное уведомление</Button>
  ),
  play: async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Показать мобильное уведомление" }));
    const title = await page.findByText("Мобильное уведомление", { exact: true });
    const notification = title.closest("[data-notification]");
    expect(notification).not.toBeNull();
    if (!(notification instanceof HTMLElement)) return;
    const bounds = notification.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(window.innerWidth);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    if (window.matchMedia("(max-width: 767px)").matches) {
      expect(bounds.left).toBeGreaterThanOrEqual(16);
      expect(document.documentElement.clientWidth - bounds.right).toBeGreaterThanOrEqual(16);
      expect(bounds.left).toBeCloseTo(16, 0);
      expect(document.documentElement.clientWidth - bounds.right).toBeCloseTo(16, 0);
    } else {
      expect(bounds.width).toBe(320);
    }
  }
};

export const Persistent: Story = {
  render: () => (
    <Button onClick={() => notify.warning({
      persistent: true,
      title: "Соединение потеряно",
      description: "Уведомление останется до явного закрытия."
    })} variant="secondary">Показать persistent</Button>
  ),
  play: async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Показать persistent" }));
    const title = await page.findByText("Соединение потеряно", { exact: true });
    const notification = title.closest("[data-notification]");
    expect(notification).not.toBeNull();
    if (!(notification instanceof HTMLElement)) return;
    expect(notification.querySelector("[data-notification-progress]")).toBeNull();
    expect(within(notification).getByRole("button", { name: "Закрыть уведомление" })).toBeInTheDocument();
  }
};

const closeDismissHandler = fn();

export const CloseButton: Story = {
  render: () => (
    <Button onClick={() => notify.info({
      duration: 10_000,
      onDismiss: closeDismissHandler,
      title: "Закрываемое уведомление"
    })} variant="secondary">
      Показать уведомление
    </Button>
  ),
  play: async () => {
    closeDismissHandler.mockClear();
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Показать уведомление" }));
    const title = await page.findByText("Закрываемое уведомление", { exact: true });
    const notification = title.closest("[data-notification]");
    expect(notification).not.toBeNull();
    if (!(notification instanceof HTMLElement)) return;
    await userEvent.click(within(notification).getByRole("button", { name: "Закрыть уведомление" }));
    await waitFor(() => expect(notification).not.toBeInTheDocument());
    expect(closeDismissHandler).toHaveBeenCalledOnce();
  }
};

const actionHandler = fn();
const actionDismissHandler = fn();

export const ActionDismiss: Story = {
  render: () => (
    <Button onClick={() => notify.error({
      action: { label: "Повторить", onClick: actionHandler },
      duration: 10_000,
      onDismiss: actionDismissHandler,
      title: "Не удалось сохранить"
    })} variant="secondary">Показать действие</Button>
  ),
  play: async () => {
    actionHandler.mockClear();
    actionDismissHandler.mockClear();
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Показать действие" }));
    await userEvent.click(await page.findByRole("button", { name: "Повторить" }));
    expect(actionHandler).toHaveBeenCalledOnce();
    await waitFor(() => expect(actionDismissHandler).toHaveBeenCalledOnce());
  }
};

const programmaticDismissHandler = fn();
const dismissAllFirstHandler = fn();
const dismissAllSecondHandler = fn();

export const ProgrammaticDismiss: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
      <Button onClick={() => {
        notify.info({
          duration: 10_000,
          id: "programmatic",
          onDismiss: programmaticDismissHandler,
          title: "Фоновая операция завершена"
        });
        notify.dismiss("programmatic");
      }} variant="secondary">Закрыть по id</Button>
      <Button onClick={() => {
        notify.info({ duration: 10_000, id: "dismiss-all-1", onDismiss: dismissAllFirstHandler, title: "Первая операция" });
        notify.warning({ duration: 10_000, id: "dismiss-all-2", onDismiss: dismissAllSecondHandler, title: "Вторая операция" });
        notify.dismiss();
      }} variant="secondary">Закрыть все</Button>
    </div>
  ),
  play: async () => {
    programmaticDismissHandler.mockClear();
    dismissAllFirstHandler.mockClear();
    dismissAllSecondHandler.mockClear();
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Закрыть по id" }));
    await waitFor(() => expect(programmaticDismissHandler).toHaveBeenCalledOnce());
    await userEvent.click(page.getByRole("button", { name: "Закрыть все" }));
    await waitFor(() => {
      expect(dismissAllFirstHandler).toHaveBeenCalledOnce();
      expect(dismissAllSecondHandler).toHaveBeenCalledOnce();
    });
  }
};

const autoDismissHandler = fn();

export const AutoDismiss: Story = {
  render: () => (
    <Button onClick={() => notify.success({
      duration: 300,
      onDismiss: autoDismissHandler,
      title: "Автоматически закрывается"
    })} variant="secondary">Проверить auto-close</Button>
  ),
  play: async () => {
    autoDismissHandler.mockClear();
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Проверить auto-close" }));
    const title = await page.findByText("Автоматически закрывается", { exact: true });
    const notification = title.closest("[data-notification]");
    expect(notification).not.toBeNull();
    if (!notification) return;
    await waitFor(() => expect(notification).not.toBeInTheDocument(), { timeout: 1_200 });
    expect(autoDismissHandler).toHaveBeenCalledOnce();
  }
};

export const HoverPauseLifecycle: Story = {
  render: () => (
    <Button onClick={() => notify.success({
      duration: 500,
      title: "Сохранено",
      description: "Ёлки, заявки и предложения обновлены."
    })} variant="secondary">Проверить паузу</Button>
  ),
  play: async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Проверить паузу" }));
    const title = await page.findByText("Сохранено", { exact: true });
    const notification = title.closest("[data-notification]");
    expect(notification).not.toBeNull();
    if (!notification) return;
    await userEvent.hover(notification);
    const progress = notification.querySelector("[data-notification-progress]");
    expect(progress).not.toBeNull();
    if (progress && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      expect(window.getComputedStyle(progress).animationPlayState).toBe("paused");
    }
    await new Promise<void>((resolve) => window.setTimeout(resolve, 650));
    expect(notification).toBeInTheDocument();
    await userEvent.unhover(notification);
    await waitFor(() => expect(notification).not.toBeInTheDocument(), { timeout: 1_200 });
  }
};

export const LongCyrillicContent: Story = {
  render: () => (
    <Notification
      closeButton={false}
      description="Изменения ещё обрабатываются. Дождитесь завершения синхронизации заявок, предложений и справочников."
      title="Предупреждение о синхронизации данных"
      variant="warning"
    />
  )
};
