import "./scrollbar.css";

export type ScrollbarSize = "default" | "compact";

const scrollbarClassNames: Record<ScrollbarSize, string> = {
  default: "ds-scrollbar",
  compact: "ds-scrollbar-compact"
};

export function scrollbarClassName(size: ScrollbarSize = "default") {
  return scrollbarClassNames[size];
}

