import { Toaster, toast } from "sonner";
import type { CSSProperties } from "react";
import { Notification } from "../Notification.js";
import type {
  NotificationId,
  NotificationOptions,
  NotificationProviderProps
} from "../Notification.types.js";
import styles from "../Notification.module.css";

const TOASTER_ID = "ds-notifications";
const DEFAULT_DURATION = 4_000;

export function NotificationHost({
  containerLabel = "Notifications",
  visibleNotifications = 4
}: NotificationProviderProps) {
  const viewportStyle = {
    "--width": "var(--ds-size-notification-inline)",
    "--gap": "var(--ds-space-3)"
  } as CSSProperties;

  return (
    <Toaster
      className={styles.viewport}
      containerAriaLabel={containerLabel}
      duration={DEFAULT_DURATION}
      expand
      gap={0}
      id={TOASTER_ID}
      mobileOffset={{
        top: "max(var(--ds-space-4), env(safe-area-inset-top))",
        right: "max(var(--ds-space-4), env(safe-area-inset-right))",
        bottom: "max(var(--ds-space-4), env(safe-area-inset-bottom))",
        left: "max(var(--ds-space-4), env(safe-area-inset-left))"
      }}
      offset="var(--ds-space-6)"
      position="top-right"
      swipeDirections={["right", "left"]}
      style={viewportStyle}
      toastOptions={{ unstyled: true }}
      visibleToasts={visibleNotifications}
    />
  );
}

export function showNotification(options: NotificationOptions): NotificationId {
  const duration = options.persistent ? Infinity : (options.duration ?? DEFAULT_DURATION);
  let dismissed = false;
  const handleDismiss = () => {
    if (dismissed) return;
    dismissed = true;
    options.onDismiss?.();
  };

  return toast.custom((id) => (
    <Notification
      {...(options.action ? { action: {
        label: options.action.label,
        onClick: () => {
          options.action?.onClick();
          toast.dismiss(id);
        }
      } } : {})}
      closeButton={options.closeButton ?? true}
      description={options.description}
      duration={duration}
      onClose={() => toast.dismiss(id)}
      persistent={options.persistent ?? false}
      title={options.title}
      variant={options.variant ?? "neutral"}
    />
  ), {
    duration,
    ...(options.id === undefined ? {} : { id: options.id }),
    onAutoClose: handleDismiss,
    onDismiss: handleDismiss,
    toasterId: TOASTER_ID,
    unstyled: true
  });
}

export function dismissNotification(id?: NotificationId): void {
  toast.dismiss(id);
}
