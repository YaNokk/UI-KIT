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
    include: ["react/jsx-dev-runtime"],
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
