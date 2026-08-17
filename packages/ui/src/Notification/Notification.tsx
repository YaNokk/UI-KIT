import { X } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { classNames } from "../shared/classNames.js";
import { FeedbackIcon } from "../internal/feedback/FeedbackIcon.js";
import feedbackStyles from "../internal/feedback/FeedbackSurface.module.css";
import { useResolvedLocale } from "../internal/locale/LocaleContext.js";
import type { NotificationProps } from "./Notification.types.js";
import styles from "./Notification.module.css";

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
  const [documentHidden, setDocumentHidden] = useState(
    () => typeof document !== "undefined" && document.hidden
  );
  const [pointerPaused, setPointerPaused] = useState(false);
  const progressStyle = {
    "--ds-notification-duration": `${Math.max(0, duration)}ms`
  } as CSSProperties;

  useEffect(() => {
    const handleVisibilityChange = () => setDocumentHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div
      className={classNames(styles.root, feedbackStyles.surface)}
      data-document-hidden={documentHidden ? "true" : undefined}
      data-feedback-variant={variant}
      data-notification=""
      data-pointer-paused={pointerPaused ? "true" : undefined}
      data-variant={variant}
      onMouseEnter={() => setPointerPaused(true)}
      onMouseLeave={() => setPointerPaused(false)}
      role={variant === "error" ? "alert" : "status"}
    >
      <FeedbackIcon className={styles.icon} variant={variant} />
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
          <span className={styles.progress} data-notification-progress="" style={progressStyle} />
        </span>
      ) : null}
    </div>
  );
}
