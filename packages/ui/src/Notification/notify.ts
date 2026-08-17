import type { NotificationVariant, Notify, NotifyOptions } from "./Notification.types.js";
import { dismissNotification, showNotification } from "./internal/sonnerAdapter.js";

function withVariant(
  variant: NotificationVariant,
  options: Omit<NotifyOptions, "variant">
) {
  return showNotification({ ...options, variant });
}

export const notify: Notify = Object.assign(
  (options: NotifyOptions) => showNotification(options),
  {
    success: (options: Omit<NotifyOptions, "variant">) => withVariant("success", options),
    error: (options: Omit<NotifyOptions, "variant">) => withVariant("error", options),
    warning: (options: Omit<NotifyOptions, "variant">) => withVariant("warning", options),
    info: (options: Omit<NotifyOptions, "variant">) => withVariant("info", options),
    neutral: (options: Omit<NotifyOptions, "variant">) => withVariant("neutral", options),
    dismiss: dismissNotification
  }
);
