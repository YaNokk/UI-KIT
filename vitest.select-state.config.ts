/// <reference types="@vitest/browser/providers/playwright" />

import { defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    include: [
      "@floating-ui/react",
      "@radix-ui/react-dialog",
      "react-dom",
      "react/jsx-dev-runtime",
      "virtua"
    ]
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium", name: "chromium-select-state-capture" }],
      provider: "playwright"
    },
    include: [
      "packages/ui/src/internal/select/SelectTagRemoveStateCapture.browser.test.tsx"
    ]
  }
});
