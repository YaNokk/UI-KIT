import { createRoot } from "react-dom/client";
import { DateRangeInput } from "@mypoint/ui/date-range-input";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <DateRangeInput
    aria-label="Tree-shaken date range input"
    value={{ from: "2026-08-02", to: "2026-08-09" }}
  />
);
