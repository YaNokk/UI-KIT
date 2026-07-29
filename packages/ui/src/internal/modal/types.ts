import type {
  ModalOpenChangeMeta
} from "../../modal/types";

export type ModalKind = "dialog" | "drawer" | "bottom-sheet";

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
