import { createRoot } from "react-dom/client";
import "@mypoint/ui/fonts.css";
import "@mypoint/ui/styles.css";
import { Button } from "@mypoint/ui";

const root = document.createElement("div");
document.body.append(root);

createRoot(root).render(
  <Button variant="primary">Button with optional Inter assets</Button>
);
