import { createRoot } from "react-dom/client";
import { IconButton } from "@mypoint/ui/icon-button";
import { Search } from "lucide-react";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <IconButton aria-label="Поиск" icon={<Search />} />
);
