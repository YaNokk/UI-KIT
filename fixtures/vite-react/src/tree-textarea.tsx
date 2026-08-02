import { createRoot } from "react-dom/client";
import { Textarea } from "@mypoint/ui/textarea";
import "@mypoint/ui/styles.css";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <Textarea aria-label="Tree-shaken textarea" showCount />
);
