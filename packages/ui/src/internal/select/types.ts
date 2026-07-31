import type { ReactNode } from "react";

export type SelectCollectionStatus =
  | "ready"
  | "loading"
  | "loading-more"
  | "error";

export interface SelectCollectionState {
  status: SelectCollectionStatus;
  message?: ReactNode;
  onRetry?: () => void;
}

export type SelectPresentation = "popover" | "sheet";

export interface SelectMessages {
  clear: string;
  done: string;
  empty: string;
  error: string;
  loading: string;
  retry: string;
  remove: (textValue: string) => string;
  selectedCount: (count: number) => string;
  sheetTitle: string;
  sheetClose: string;
}

export interface SelectDisplayData {
  label: ReactNode;
  textValue: string;
  leading?: ReactNode;
  description?: ReactNode;
}
