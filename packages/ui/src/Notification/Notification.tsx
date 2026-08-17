import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";
import type { CSSProperties, ComponentType, SVGProps } from "react";
import { useResolvedLocale } from "../internal/locale/LocaleContext.js";
import type { NotificationProps, NotificationVariant } from "./Notification.types.js";
import styles from "./Notification.module.css";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const icons: Record<NotificationVariant, Icon> = {
  success: CircleCheck,
  error: CircleX,
  warning: CircleAlert,
  info: Info,
  neutral: Info
};

function resolveCloseLabel(locale: string): string {
  const language = locale.toLowerCase().split("-")[0];
  if (language === "ru") return "Закрыть уведомление";
  if (language === "kk") return "Хабарландыруды жабу";
  return "Close notification";
}

export function Notification({
  variant = "neutral",
  title,
  description,
  action,
  closeButton = true,
  closeLabel,
  duration = 4_000,
  persistent = false,
  onClose
}: NotificationProps) {
  const locale = useResolvedLocale();
  const Icon = icons[variant];
  const progressStyle = {
    "--ds-notification-duration": `${Math.max(0, duration)}ms`
  } as CSSProperties;

  return (
    <div
      className={styles.root}
      data-notification=""
      data-variant={variant}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className={styles.icon} focusable="false" />
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {description != null ? <div className={styles.description}>{description}</div> : null}
        {action ? (
          <button className={styles.action} onClick={action.onClick} type="button">
            {action.label}
          </button>
        ) : null}
      </div>
      {closeButton && onClose ? (
        <button
          aria-label={closeLabel ?? resolveCloseLabel(locale)}
          className={styles.close}
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" focusable="false" />
        </button>
      ) : null}
      {!persistent && duration > 0 ? (
        <span aria-hidden="true" className={styles.progressTrack}>
          <span className={styles.progress} style={progressStyle} />
        </span>
      ) : null}
    </div>
  );
}
