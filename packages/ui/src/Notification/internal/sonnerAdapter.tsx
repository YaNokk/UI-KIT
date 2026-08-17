import { Toaster, toast } from "sonner";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { Notification } from "../Notification.js";
import type {
  NotificationId,
  NotificationProviderProps,
  NotifyOptions
} from "../Notification.types.js";
import styles from "../Notification.module.css";

const TOASTER_ID = "ds-notifications";
const DEFAULT_DURATION = 4_000;
let mountedHostCount = 0;
let missingProviderId = 0;
let renderVersion = 0;

interface NotificationLifecycle {
  dismissed: boolean;
  onDismiss?: () => void;
}

const lifecycleById = new Map<NotificationId, NotificationLifecycle>();

function completeLifecycle(id: NotificationId) {
  const lifecycle = lifecycleById.get(id);
  if (!lifecycle || lifecycle.dismissed) return;
  lifecycle.dismissed = true;
  lifecycleById.delete(id);
  lifecycle.onDismiss?.();
}

export function NotificationHost({
  containerLabel = "Notifications",
  visibleNotifications = 4
}: NotificationProviderProps) {
  const hostRef = useRef<HTMLElement>(null);
  const viewportStyle = {
    "--width": "var(--ds-size-notification-inline)",
    "--gap": "var(--ds-space-3)"
  } as CSSProperties;

  useLayoutEffect(() => {
    mountedHostCount += 1;
    return () => {
      mountedHostCount = Math.max(0, mountedHostCount - 1);
    };
  }, []);

  useLayoutEffect(() => {
    // Notification content owns polite/assertive semantics. Keeping the host
    // at `off` also preserves Radix modal's aria-live exemption without a
    // second announcement from Sonner's default polite region.
    hostRef.current?.setAttribute("aria-live", "off");
  });

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
      ref={hostRef}
      swipeDirections={["right", "left"]}
      style={viewportStyle}
      toastOptions={{ unstyled: true }}
      visibleToasts={visibleNotifications}
    />
  );
}

export function showNotification(options: NotifyOptions): NotificationId {
  if (mountedHostCount === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[mypoint/ui] notify() requires a mounted NotificationProvider. The notification was ignored."
      );
    }
    missingProviderId += 1;
    return `notification-missing-provider-${missingProviderId}`;
  }

  const duration = options.persistent ? Infinity : (options.duration ?? DEFAULT_DURATION);
  const currentRenderVersion = ++renderVersion;
  function handleDismiss() {
    completeLifecycle(notificationId);
  }
  const notificationId: NotificationId = toast.custom((id) => (
    <Notification
      {...(options.action ? { action: {
        label: options.action.label,
        onClick: () => {
          try {
            options.action?.onClick();
          } finally {
            toast.dismiss(id);
          }
        }
      } } : {})}
      closeButton={options.closeButton ?? true}
      description={options.description}
      duration={duration}
      onClose={() => toast.dismiss(id)}
      persistent={options.persistent ?? false}
      key={currentRenderVersion}
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

  const lifecycle = lifecycleById.get(notificationId);
  if (lifecycle && !lifecycle.dismissed) {
    if (options.onDismiss === undefined) delete lifecycle.onDismiss;
    else lifecycle.onDismiss = options.onDismiss;
  } else {
    lifecycleById.set(notificationId, {
      dismissed: false,
      ...(options.onDismiss === undefined ? {} : { onDismiss: options.onDismiss })
    });
  }

  return notificationId;
}

export function dismissNotification(id?: NotificationId): void {
  toast.dismiss(id);
}
