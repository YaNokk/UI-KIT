import type { ReactNode } from "react";

export type NotificationId = string | number;
export type NotificationVariant = "success" | "error" | "warning" | "info" | "neutral";

export interface NotificationAction {
  label: ReactNode;
  onClick: () => void;
}

export interface NotificationOptions {
  id?: NotificationId;
  variant?: NotificationVariant;
  title: ReactNode;
  description?: ReactNode;
  action?: NotificationAction;
  closeButton?: boolean;
  duration?: number;
  persistent?: boolean;
  onDismiss?: () => void;
}

export interface NotificationProps extends Omit<NotificationOptions, "id" | "onDismiss"> {
  closeLabel?: string;
  onClose?: () => void;
}

export interface NotificationProviderProps {
  containerLabel?: string;
  visibleNotifications?: number;
}

export interface Notify {
  (options: NotificationOptions): NotificationId;
  success(options: Omit<NotificationOptions, "variant">): NotificationId;
  error(options: Omit<NotificationOptions, "variant">): NotificationId;
  warning(options: Omit<NotificationOptions, "variant">): NotificationId;
  info(options: Omit<NotificationOptions, "variant">): NotificationId;
  neutral(options: Omit<NotificationOptions, "variant">): NotificationId;
  dismiss(id?: NotificationId): void;
}
