import { createRoot } from "react-dom/client";
import "@mypoint/ui/styles.css";
import { Spinner } from "@mypoint/ui/spinner";

const root = document.createElement("div");
document.body.append(root);

createRoot(root).render(
  <Spinner label="Загрузка заказов" size="lg" tone="accent" />
);
