import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@mypoint/ui/styles.css";

const LazyButtonLink = lazy(async () => {
  const module = await import("@mypoint/ui/button-link");
  return { default: module.ButtonLink };
});

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
  <Suspense fallback={null}>
    <LazyButtonLink href="/orders" variant="primary">
      Ленивая ссылка-кнопка
    </LazyButtonLink>
  </Suspense>
);
