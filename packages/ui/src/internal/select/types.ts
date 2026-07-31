import type { ReactNode } from "react";

export type SelectCollectionStatus =
  | "ready"
  | "loading"
  | "refreshing"
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
  noResults: string;
  search: string;
  searchPlaceholder: string;
  retry: string;
  remove: (textValue: string) => string;
  selectedCount: (count: number) => string;
  selectedSummary: (items: readonly string[]) => string;
  sheetTitle: string;
  sheetClose: string;
}

export interface SelectSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  filter?: (itemText: string, query: string) => boolean;
}

export interface SelectDisplayData {
  label: ReactNode;
  textValue: string;
  leading?: ReactNode;
  description?: ReactNode;
}
