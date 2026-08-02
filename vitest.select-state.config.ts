/// <reference types="@vitest/browser/providers/playwright" />

import { defineConfig } from "vitest/config";
import {
  workspaceAliases,
  workspaceTokenCssAliases,
} from "./vitest.workspace-aliases";

export default defineConfig({
  resolve: {
    alias: [...workspaceAliases, ...workspaceTokenCssAliases],
  },
  optimizeDeps: {
    exclude: ["@mypoint/tokens"],
    include: [
      "@floating-ui/react",
      "@radix-ui/react-dialog",
      "react-dom",
      "react/jsx-dev-runtime",
      "virtua",
    ],
  },
  test: {
    browser: {
      enabled: true,
      api: { host: "127.0.0.1" },
      headless: true,
      instances: [{ browser: "chromium", name: "chromium-select-state-capture" }],
      provider: "playwright"
    },
    include: [
      "packages/ui/src/internal/select/SelectTagRemoveStateCapture.browser.test.tsx"
    ]
  }
});
