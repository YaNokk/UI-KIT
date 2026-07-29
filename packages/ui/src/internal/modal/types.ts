import type { ReactNode, RefObject } from "react";

export type ModalKind = "dialog" | "drawer" | "bottom-sheet";

export type ModalCloseReason =
  | "escape"
  | "backdrop"
  | "swipe"
  | "close-button"
  | "ancestor";

export interface ModalOpenChangeMeta {
  reason: ModalCloseReason;
}

export interface ModalRegistration {
  id: string;
  parentId: string | null;
  kind: ModalKind;
  open: boolean;
  dim: boolean;
  dismissOnBackdrop: boolean;
  dismissOnEscape: boolean;
  ownerDocument: Document;
  getRequestedOpen: () => boolean;
  onOpenChange: (open: boolean, meta: ModalOpenChangeMeta) => void;
}

export interface ModalEntryView {
  active: boolean;
  depth: number;
  floatingLayer: number;
  guardLayer: number;
  registered: boolean;
  surfaceLayer: number;
  top: boolean;
}

export interface SharedModalProps {
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
