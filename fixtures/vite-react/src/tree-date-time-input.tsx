import { createRoot } from "react-dom/client";
import { DateTimeInput } from "@mypoint/ui/date-time-input";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <DateTimeInput
    aria-label="Tree-shaken date time input"
    value="2026-08-02T10:15"
  />
);
