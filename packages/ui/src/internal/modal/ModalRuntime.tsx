import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode
} from "react";
import { primitiveTokens } from "@mypoint/tokens";
import { acquireDocumentScrollLock, type DocumentScrollLock } from "./scrollLock";
import type {
  ModalEntryView,
  ModalRegistration
} from "./types";
import type { ModalCloseReason } from "../../modal/types";

export const MODAL_LAYER_STRIDE = 8;
const MODAL_BASE_LAYER = primitiveTokens["zIndex.modal"];

interface RuntimeEntry extends ModalRegistration {
  activationOrder: number;
  activationVersion: number;
  closeRequestedVersion: number;
  invalidatedVersion: number;
  warnedInvalidationVersion: number;
  surface: HTMLElement | null;
}

interface InvalidatedTombstone {
  invalidatedVersion: number;
  warned: boolean;
}

export interface ModalRuntimeStore {
  destroy(): void;
  getActiveDrawerWorkspace(id: string): {
    child: HTMLElement;
    parent: HTMLElement;
  } | null;
  getEntryView(id: string): ModalEntryView;
  getVersion(): number;
  register(registration: ModalRegistration): () => void;
  requestClose(id: string, reason: ModalCloseReason): void;
  setSurface(id: string, surface: HTMLElement | null): void;
  subscribe(listener: () => void): () => void;
  update(id: string, registration: ModalRegistration): void;
}

const emptyView: ModalEntryView = {
  active: false,
  activeChildKind: null,
  depth: -1,
  drawerBranchHasAdjacentPair: false,
  drawerPresentation: null,
  drawerWorkspaceActive: false,
  drawerWorkspaceReady: false,
  floatingLayer: MODAL_BASE_LAYER + 2,
  guardLayer: MODAL_BASE_LAYER,
  registered: false,
  surfaceLayer: MODAL_BASE_LAYER + 1,
  surfaceReady: false,
  top: false
};

function createModalRuntimeStore(): ModalRuntimeStore {
  const entries = new Map<string, RuntimeEntry>();
  const tombstones = new Map<string, InvalidatedTombstone>();
  const listeners = new Set<() => void>();
  let activationOrder = 0;
  let version = 0;
  let scrollLock: DocumentScrollLock | null = null;
  let lockedDocument: Document | null = null;

  const eligible = (entry: RuntimeEntry) =>
    entry.open && entry.activationVersion > entry.invalidatedVersion;

  const getBranch = (): RuntimeEntry[] => {
    const roots = [...entries.values()]
      .filter((entry) => entry.parentId === null && eligible(entry))
      .sort((left, right) => right.activationOrder - left.activationOrder);
    const root = roots[0];
    if (!root) return [];

    const branch = [root];
    let current = root;
    while (true) {
      const child = [...entries.values()]
        .filter(
          (entry) => entry.parentId === current.id && eligible(entry)
        )
        .sort((left, right) => right.activationOrder - left.activationOrder)[0];
      if (!child) break;
      branch.push(child);
      current = child;
    }
    return branch;
  };

  const syncScrollLock = () => {
    const branch = getBranch();
    const nextDocument = branch[0]?.ownerDocument ?? null;

    if (nextDocument && (!scrollLock || lockedDocument !== nextDocument)) {
      scrollLock?.release();
      scrollLock = acquireDocumentScrollLock(nextDocument);
      lockedDocument = nextDocument;
      return;
    }

    if (!nextDocument && scrollLock) {
      scrollLock.release();
      scrollLock = null;
      lockedDocument = null;
    }
  };

  const emit = () => {
    version += 1;
    syncScrollLock();
    listeners.forEach((listener) => listener());
  };

  const descendantsOf = (id: string): RuntimeEntry[] => {
    const descendants: RuntimeEntry[] = [];
    const visit = (parentId: string) => {
      for (const entry of entries.values()) {
        if (entry.parentId !== parentId) continue;
        descendants.push(entry);
        visit(entry.id);
      }
    };
    visit(id);
    return descendants;
  };

  const notifyClose = (entry: RuntimeEntry, reason: ModalCloseReason) => {
    if (entry.closeRequestedVersion === entry.activationVersion) return;
    entry.closeRequestedVersion = entry.activationVersion;
    const callback = entry.onOpenChange;
    queueMicrotask(() => callback(false, { reason }));
  };

  const invalidate = (entry: RuntimeEntry) => {
    if (entry.invalidatedVersion >= entry.activationVersion) return;
    entry.invalidatedVersion = entry.activationVersion;
    tombstones.set(entry.id, {
      invalidatedVersion: entry.activationVersion,
      warned: false
    });
    notifyClose(entry, "ancestor");
  };

  const invalidateDescendants = (id: string) => {
    descendantsOf(id).forEach(invalidate);
  };

  const hasClosingAncestor = (entry: RuntimeEntry) => {
    let parentId = entry.parentId;
    while (parentId) {
      const parent = entries.get(parentId);
      if (!parent) return true;
      if (!parent.getRequestedOpen()) return true;
      parentId = parent.parentId;
    }
    return false;
  };

  const warnSuppressedDescendants = (id: string) => {
    if (process.env.NODE_ENV === "production") return;
    for (const entry of descendantsOf(id)) {
      if (
        !entry.open
        || entry.activationVersion > entry.invalidatedVersion
        || entry.warnedInvalidationVersion === entry.invalidatedVersion
      ) {
        continue;
      }
      entry.warnedInvalidationVersion = entry.invalidatedVersion;
      const tombstone = tombstones.get(entry.id);
      if (tombstone) tombstone.warned = true;
      console.warn(
        "A controlled modal remained open after receiving an ancestor close "
          + "request. Update its controlled `open` state to false before "
          + "opening it again."
      );
    }
  };

  return {
    destroy() {
      entries.clear();
      tombstones.clear();
      scrollLock?.release();
      scrollLock = null;
      lockedDocument = null;
      emit();
    },
    getActiveDrawerWorkspace(id) {
      const branch = getBranch();
      for (let index = branch.length - 1; index > 0; index -= 1) {
        const child = branch[index];
        const parent = branch[index - 1];
        if (child?.kind !== "drawer" || parent?.kind !== "drawer") continue;
        if (child.id !== id || branch.at(-1)?.id !== child.id) return null;
        const childSurface = child.surface;
        const parentSurface = parent.surface;
        if (!childSurface || !parentSurface) return null;
        return { child: childSurface, parent: parentSurface };
      }
      return null;
    },
    getEntryView(id) {
      const entry = entries.get(id);
      if (!entry) return emptyView;
      const branch = getBranch();
      const depth = branch.findIndex((item) => item.id === id);
      const active = depth >= 0;
      const activeChildKind = active ? branch[depth + 1]?.kind ?? null : null;
      let adjacentParentId: string | null = null;
      let adjacentChildId: string | null = null;
      for (let index = branch.length - 1; index > 0; index -= 1) {
        if (
          branch[index]?.kind === "drawer"
          && branch[index - 1]?.kind === "drawer"
        ) {
          adjacentParentId = branch[index - 1]?.id ?? null;
          adjacentChildId = branch[index]?.id ?? null;
          break;
        }
      }
      const drawerPresentation = id === adjacentParentId
        ? "adjacent-parent"
        : id === adjacentChildId
          ? "adjacent-child"
          : null;
      const drawerBranchHasAdjacentPair = adjacentChildId !== null;
      const drawerWorkspaceActive = adjacentChildId === branch.at(-1)?.id;
      const adjacentParent = adjacentParentId
        ? entries.get(adjacentParentId)
        : null;
      const adjacentChild = adjacentChildId
        ? entries.get(adjacentChildId)
        : null;
      const drawerWorkspaceReady = Boolean(
        adjacentParent?.surface && adjacentChild?.surface
      );
      const layerBase = MODAL_BASE_LAYER + Math.max(0, depth) * MODAL_LAYER_STRIDE;
      return {
        active,
        activeChildKind,
        depth,
        drawerBranchHasAdjacentPair,
        drawerPresentation,
        drawerWorkspaceActive,
        drawerWorkspaceReady,
        floatingLayer: layerBase + 2,
        guardLayer: layerBase,
        registered: true,
        surfaceLayer: layerBase + 1,
        surfaceReady: entry.surface !== null,
        top: active && depth === branch.length - 1
      };
    },
    getVersion() {
      return version;
    },
    register(registration) {
      const tombstone = tombstones.get(registration.id);
      const suppressed = Boolean(tombstone && registration.open);
      if (
        suppressed
        && process.env.NODE_ENV !== "production"
        && tombstone
        && !tombstone.warned
      ) {
        tombstone.warned = true;
        console.warn(
          "A controlled modal remained open after receiving an ancestor close "
            + "request. Update its controlled `open` state to false before "
            + "opening it again."
        );
      }
      const nextActivationVersion = registration.open ? 1 : 0;
      const entry: RuntimeEntry = {
        ...registration,
        activationOrder: registration.open ? ++activationOrder : 0,
        activationVersion: nextActivationVersion,
        closeRequestedVersion: 0,
        invalidatedVersion: suppressed
          ? tombstone?.invalidatedVersion ?? nextActivationVersion
          : 0,
        warnedInvalidationVersion: tombstone?.warned
          ? tombstone.invalidatedVersion
          : 0,
        surface: null
      };
      entries.set(entry.id, entry);
      if (!registration.open) tombstones.delete(entry.id);
      emit();

      return () => {
        const current = entries.get(entry.id);
        if (!current) return;
        if (hasClosingAncestor(current)) invalidate(current);
        entries.delete(entry.id);
        emit();
      };
    },
    requestClose(id, reason) {
      const entry = entries.get(id);
      const branch = getBranch();
      if (!entry || branch.at(-1)?.id !== id || !eligible(entry)) return;
      notifyClose(entry, reason);
      emit();
    },
    setSurface(id, surface) {
      const entry = entries.get(id);
      if (!entry || entry.surface === surface) return;
      entry.surface = surface;
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update(id, registration) {
      const entry = entries.get(id);
      if (!entry) return;
      const wasOpen = entry.open;
      Object.assign(entry, registration);

      if (!wasOpen && registration.open) {
        entry.activationVersion += 1;
        entry.activationOrder = ++activationOrder;
        entry.closeRequestedVersion = 0;
        tombstones.delete(entry.id);
        warnSuppressedDescendants(entry.id);
      } else if (wasOpen && !registration.open) {
        tombstones.delete(entry.id);
        invalidateDescendants(entry.id);
      }
      emit();
    }
  };
}

const ModalRuntimeContext = createContext<ModalRuntimeStore | null>(null);
export const ModalParentContext = createContext<string | null>(null);

export interface ModalFocusReturnValue {
  getFallbackTarget(): HTMLElement | null;
}

export const ModalFocusReturnContext =
  createContext<ModalFocusReturnValue | null>(null);

export interface ModalLayerValue {
  floatingContainer: HTMLElement | null;
  floatingLayer: number;
  modalId: string;
  surfaceLayer: number;
}

export const ModalLayerContext = createContext<ModalLayerValue | null>(null);

const fallbackStores = new WeakMap<Document, ModalRuntimeStore>();

function getFallbackStore(ownerDocument: Document) {
  const existing = fallbackStores.get(ownerDocument);
  if (existing) return existing;
  const store = createModalRuntimeStore();
  fallbackStores.set(ownerDocument, store);
  return store;
}

export function ModalRuntimeProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createModalRuntimeStore);
  useEffect(() => () => store.destroy(), [store]);
  return (
    <ModalRuntimeContext.Provider value={store}>
      {children}
    </ModalRuntimeContext.Provider>
  );
}

export function useResolvedModalRuntime(): ModalRuntimeStore | null {
  const configured = useContext(ModalRuntimeContext);
  const [ownerDocument, setOwnerDocument] = useState<Document | null>(null);

  useEffect(() => {
    setOwnerDocument(document);
  }, []);

  return useMemo(
    () => configured ?? (ownerDocument ? getFallbackStore(ownerDocument) : null),
    [configured, ownerDocument]
  );
}

export function useModalEntryView(
  store: ModalRuntimeStore | null,
  id: string
): ModalEntryView {
  useSyncExternalStore(
    store?.subscribe ?? (() => () => undefined),
    store?.getVersion ?? (() => 0),
    () => 0
  );
  return store?.getEntryView(id) ?? emptyView;
}
