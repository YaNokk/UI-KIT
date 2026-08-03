import { createRoot } from "react-dom/client";
import { DateInput } from "@mypoint/ui/date-input";
import "@mypoint/ui/styles.css";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <DateInput aria-label="Tree-shaken date input" value="2026-08-02" />
);
