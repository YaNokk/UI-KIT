import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import type { FeedbackVariant } from "./feedback.types.js";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const feedbackIcons: Record<FeedbackVariant, IconComponent> = {
  success: CircleCheck,
  error: CircleX,
  warning: CircleAlert,
  info: Info,
  neutral: Info
};

interface FeedbackIconProps {
  className?: string;
  icon?: ReactNode | false;
  variant: FeedbackVariant;
}

export function FeedbackIcon({ className, icon, variant }: FeedbackIconProps) {
  if (icon === false) return null;

  if (icon != null) {
    return (
      <span aria-hidden="true" className={className} data-feedback-icon="">
        {icon}
      </span>
    );
  }

  const Icon = feedbackIcons[variant];
  return (
    <Icon
      aria-hidden="true"
      className={className}
      data-feedback-icon=""
      focusable="false"
    />
  );
}
