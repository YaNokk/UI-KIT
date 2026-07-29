import { createRoot } from "react-dom/client";
import "@mypoint/ui/styles.css";
import { Amount } from "@mypoint/ui";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <Amount currency="PLN" locale="pl-PL" value={123456} />
);
