import { Ellipsis } from "lucide-react";
import type { ReactNode } from "react";
import { ActionMenu } from "../ActionMenu/ActionMenu";
import { resolveActionMenuLabels } from "../ActionMenu/labels";
import type {
  ActionMenuAction,
  ActionMenuDangerAction,
  ActionMenuNeutralAction
} from "../ActionMenu/types";
import { IconButton } from "../IconButton/IconButton";
import { useResolvedLocale } from "../internal/locale/LocaleContext";

export type ModalHeaderNeutralAction = ActionMenuNeutralAction;
export type ModalHeaderDangerAction = ActionMenuDangerAction;
export type ModalHeaderAction = ActionMenuAction;

export interface ModalHeaderActionsProps {
  actions: readonly ModalHeaderAction[];
  closeLabel?: string;
  label?: string;
  onActionError?: (error: unknown, action: ModalHeaderAction) => void;
  title?: ReactNode;
}

export function ModalHeaderActions({
  actions,
  closeLabel,
  label,
  onActionError,
  title,
}: ModalHeaderActionsProps) {
  const locale = useResolvedLocale();
  const labels = resolveActionMenuLabels(locale);

  return (
    <ActionMenu
      actions={actions}
      {...(closeLabel === undefined ? {} : { closeLabel })}
      {...(onActionError === undefined ? {} : { onActionError })}
      {...(title === undefined ? {} : { title })}
      trigger={(
        <IconButton
          aria-label={label ?? labels.trigger}
          icon={<Ellipsis />}
          size="sm"
          variant="ghost"
        />
      )}
    />
  );
}
