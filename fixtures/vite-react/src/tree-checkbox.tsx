import { createRoot } from "react-dom/client";
import { Checkbox } from "@mypoint/ui/checkbox";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(<Checkbox defaultChecked label="Tree-shaken checkbox" />);
