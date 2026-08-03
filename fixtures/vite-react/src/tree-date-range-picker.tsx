import { createRoot } from "react-dom/client";
import { DateRangePicker } from "@mypoint/ui/date-range-picker";
import "@mypoint/ui/styles.css";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <DateRangePicker
    label="Tree-shaken date range"
    value={{ from: "2026-08-01", to: "2026-08-02" }}
  />
);
