import { createRoot } from "react-dom/client";
import "@mypoint/ui/styles.css";
import { ButtonLink } from "@mypoint/ui/button-link";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <ButtonLink href="/orders" variant="primary">Заказы</ButtonLink>
);
