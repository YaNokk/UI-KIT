/// <reference types="@vitest/browser/providers/playwright" />

import { defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    include: ["react/jsx-dev-runtime"]
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium", name: "chromium-state-capture" }],
      provider: "playwright"
    },
    include: [
      "packages/ui/src/internal/choice-control/ChoiceControlStateCapture.browser.test.tsx"
    ]
  }
});
