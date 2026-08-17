import { Portal } from "../Portal/Portal.js";
import { useResolvedLocale } from "../internal/locale/LocaleContext.js";
import type { NotificationProviderProps } from "./Notification.types.js";
import { NotificationHost } from "./internal/sonnerAdapter.js";

function resolveContainerLabel(locale: string): string {
  const language = locale.toLowerCase().split("-")[0];
  if (language === "ru") return "Уведомления";
  if (language === "kk") return "Хабарландырулар";
  return "Notifications";
}

export function NotificationProvider({
  containerLabel,
  visibleNotifications
}: NotificationProviderProps) {
  const locale = useResolvedLocale();

  return (
    <Portal>
      <NotificationHost
        containerLabel={containerLabel ?? resolveContainerLabel(locale)}
        {...(visibleNotifications === undefined ? {} : { visibleNotifications })}
      />
    </Portal>
  );
}
