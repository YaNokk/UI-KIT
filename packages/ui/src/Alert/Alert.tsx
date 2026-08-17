import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode
} from "react";
import { classNames } from "../shared/classNames.js";
import { FeedbackIcon } from "../internal/feedback/FeedbackIcon.js";
import type { FeedbackVariant } from "../internal/feedback/feedback.types.js";
import feedbackStyles from "../internal/feedback/FeedbackSurface.module.css";
import styles from "./Alert.module.css";

export type AlertVariant = FeedbackVariant;

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  children?: ReactNode;
  icon?: ReactNode | false;
  title?: ReactNode;
  variant?: AlertVariant;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    children,
    className,
    icon,
    title,
    variant = "neutral",
    ...nativeProps
  },
  ref
) {
  return (
    <div
      {...nativeProps}
      className={classNames(styles.root, feedbackStyles.surface, className)}
      data-alert=""
      data-feedback-variant={variant}
      data-has-icon={icon === false ? "false" : "true"}
      data-variant={variant}
      ref={ref}
    >
      <FeedbackIcon className={styles.icon} icon={icon} variant={variant} />
      {title != null || children != null ? (
        <div className={styles.content}>
          {title != null ? <div className={styles.title}>{title}</div> : null}
          {children != null ? <div className={styles.body}>{children}</div> : null}
        </div>
      ) : null}
    </div>
  );
});
