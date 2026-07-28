import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@mypoint/ui/styles.css";

const LazyButton = lazy(async () => {
  const module = await import("@mypoint/ui/button");
  return { default: module.Button };
});

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <Suspense fallback={null}>
    <LazyButton variant="primary">Ленивая кнопка</LazyButton>
  </Suspense>
);
