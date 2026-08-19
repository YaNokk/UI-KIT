import type { ReactNode } from "react";

interface ActionMenuBaseAction {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  onSelect: () => void | Promise<void>;
}

export interface ActionMenuNeutralAction extends ActionMenuBaseAction {
  tone?: "neutral";
}

export interface ActionMenuDangerAction extends ActionMenuBaseAction {
  tone: "danger";
  confirmation: false | {
    title: ReactNode;
    description?: ReactNode;
    confirmLabel: string;
    cancelLabel: string;
  };
}

export type ActionMenuAction =
  | ActionMenuNeutralAction
  | ActionMenuDangerAction;
