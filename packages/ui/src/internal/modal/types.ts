import type {
  ModalOpenChangeMeta
} from "../../modal/types";

export type ModalKind = "dialog" | "drawer" | "bottom-sheet";
export type DrawerPresentation = "adjacent-child" | "adjacent-parent";

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
  activeChildKind: ModalKind | null;
  depth: number;
  drawerBranchHasAdjacentPair: boolean;
  drawerPresentation: DrawerPresentation | null;
  drawerWorkspaceActive: boolean;
  drawerWorkspaceReady: boolean;
  floatingLayer: number;
  guardLayer: number;
  registered: boolean;
  surfaceLayer: number;
  surfaceReady: boolean;
  top: boolean;
}
