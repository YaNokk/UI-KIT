import { createRoot } from "react-dom/client";
import { Search } from "lucide-react";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <span>
    <Search aria-hidden="true" />
    Поиск
  </span>
);
