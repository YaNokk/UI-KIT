import { createRoot } from "react-dom/client";
import { DateTimePicker } from "@mypoint/ui/date-time-picker";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <DateTimePicker
    aria-label="Tree-shaken date time picker"
    value="2026-08-02T10:15"
  />
);
