import type { NotificationOptions, NotificationVariant, Notify } from "./Notification.types.js";
import { dismissNotification, showNotification } from "./internal/sonnerAdapter.js";

function withVariant(
  variant: NotificationVariant,
  options: Omit<NotificationOptions, "variant">
) {
  return showNotification({ ...options, variant });
}

export const notify: Notify = Object.assign(
  (options: NotificationOptions) => showNotification(options),
  {
    success: (options: Omit<NotificationOptions, "variant">) => withVariant("success", options),
    error: (options: Omit<NotificationOptions, "variant">) => withVariant("error", options),
    warning: (options: Omit<NotificationOptions, "variant">) => withVariant("warning", options),
    info: (options: Omit<NotificationOptions, "variant">) => withVariant("info", options),
    neutral: (options: Omit<NotificationOptions, "variant">) => withVariant("neutral", options),
    dismiss: dismissNotification
  }
);
