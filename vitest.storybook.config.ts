/// <reference types="@vitest/browser/providers/playwright" />

import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { vitestTransform } from "storybook/internal/csf-tools";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const storybookConfigDir = path.join(dirname, "apps/storybook/.storybook-test");
function normalizePath(value: string) {
  return value.replaceAll("\\", "/");
}

// addon-vitest 9.1.20's generated import.meta.url guard does not match the
// Vitest worker path in this Windows workspace (Unicode + spaces). Keep the
// compatibility transform scoped to this one CI-only regression story.
const storybookCsfTransform: Plugin = {
  name: "storybook-csf-transform-windows-compat",
  enforce: "pre",
  async transform(code, id) {
    const normalizedId = normalizePath(id);
    if (
      !normalizedId.includes(
        "/packages/ui/src/FieldShell/InnerLabelBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/select/SelectMultiSelectBrowserRegression.stories.tsx"
      )
    ) {
      return undefined;
    }

    const transformed = await vitestTransform({
      code,
      configDir: storybookConfigDir,
      fileName: id,
      previewLevelTags: [],
      stories: [
        "../../../packages/ui/src/FieldShell/InnerLabelBrowserRegression.stories.tsx",
        "../../../packages/ui/src/internal/select/SelectMultiSelectBrowserRegression.stories.tsx"
      ],
      tagsFilter: { include: ["test"], exclude: [], skip: [] }
    });

    return {
      ...transformed,
      code: transformed.code.replace(
        "if (_isRunningFromThisFile) {",
        "if (true) {"
      )
    };
  }
};

export default defineConfig({
  optimizeDeps: {
    include: [
      "@storybook/addon-vitest/internal/test-utils",
      "markdown-to-jsx",
      "react/jsx-dev-runtime"
    ]
  },
  plugins: [storybookCsfTransform, tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^@mypoint\/tokens$/,
        replacement: fileURLToPath(
          new URL("./packages/tokens/src/index.ts", import.meta.url)
        )
      },
      {
        find: /^@mypoint\/tokens\/tokens\.css$/,
        replacement: fileURLToPath(
          new URL("./packages/tokens/generated/tokens.css", import.meta.url)
        )
      },
      {
        find: /^@mypoint\/ui$/,
        replacement: fileURLToPath(
          new URL("./packages/ui/src/index.ts", import.meta.url)
        )
      },
      {
        find: /^@mypoint\/retail-ui$/,
        replacement: fileURLToPath(
          new URL("./packages/retail-ui/src/index.ts", import.meta.url)
        )
      }
    ]
  },
  test: {
    name: "storybook",
    fileParallelism: false,
    include: [
      "packages/ui/src/FieldShell/InnerLabelBrowserRegression.stories.tsx",
      "packages/ui/src/internal/select/SelectMultiSelectBrowserRegression.stories.tsx"
    ],
    browser: {
      enabled: true,
      provider: "playwright",
      headless: true,
      instances: [
        {
          browser: "chromium",
          name: "chromium"
        },
        {
          browser: "chromium",
          context: { forcedColors: "active" },
          name: "chromium-forced-colors"
        }
      ]
    },
    setupFiles: ["./apps/storybook/.storybook-test/vitest.setup.ts"]
  }
});
