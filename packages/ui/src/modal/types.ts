import type { ReactNode, RefObject } from "react";

export type ModalCloseReason =
  | "escape"
  | "backdrop"
  | "swipe"
  | "close-button"
  | "ancestor";

export interface ModalOpenChangeMeta {
  reason: ModalCloseReason;
}

export interface ModalBaseProps {
  children: ReactNode;
  className?: string;
  closeLabel: string;
  description?: ReactNode;
  dismissOnEscape?: boolean;
  footer?: ReactNode;
  headerActions?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onOpenChange: (open: boolean, meta: ModalOpenChangeMeta) => void;
  open: boolean;
  title: ReactNode;
}
