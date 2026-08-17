import type { ReactNode } from "react";
import type { FeedbackVariant } from "../internal/feedback/feedback.types.js";

export type NotificationId = string | number;
export type NotificationVariant = FeedbackVariant;

export interface NotificationAction {
  label: ReactNode;
  onClick: () => void;
}

export interface NotificationProps {
  variant?: NotificationVariant;
  title: ReactNode;
  description?: ReactNode;
  action?: NotificationAction;
  closeButton?: boolean;
  duration?: number;
  persistent?: boolean;
  closeLabel?: string;
  onClose?: () => void;
}

export interface NotifyAction {
  label: string;
  onClick: () => void;
}

export interface NotifyOptions {
  id?: NotificationId;
  variant?: NotificationVariant;
  title: string;
  description?: string;
  action?: NotifyAction;
  closeButton?: boolean;
  duration?: number;
  persistent?: boolean;
  onDismiss?: () => void;
}

export interface NotificationProviderProps {
  containerLabel?: string;
  visibleNotifications?: number;
}

export interface Notify {
  (options: NotifyOptions): NotificationId;
  success(options: Omit<NotifyOptions, "variant">): NotificationId;
  error(options: Omit<NotifyOptions, "variant">): NotificationId;
  warning(options: Omit<NotifyOptions, "variant">): NotificationId;
  info(options: Omit<NotifyOptions, "variant">): NotificationId;
  neutral(options: Omit<NotifyOptions, "variant">): NotificationId;
  dismiss(id?: NotificationId): void;
}
