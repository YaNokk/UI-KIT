/// <reference types="@vitest/browser/providers/playwright" />

import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { vitestTransform } from "storybook/internal/csf-tools";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { forceExecuteTransformedStories } from "./scripts/storybook-csf-transform.mjs";
import {
  workspaceAliases,
  workspaceTokenCssAliases,
} from "./vitest.workspace-aliases";

const storyPath = "packages/ui/src/Textarea/TextareaBrowserRegression.stories.tsx";
const storybookConfigDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "apps/storybook/.storybook-test",
);

const forcedColorsStoryTransform: Plugin = {
  name: "textarea-forced-colors-story-transform",
  enforce: "pre",
  async transform(code, id) {
    if (!id.replaceAll("\\", "/").endsWith(`/${storyPath}`)) return undefined;
    const transformed = await vitestTransform({
      code,
      configDir: storybookConfigDir,
      fileName: id,
      previewLevelTags: [],
      stories: [`../../../${storyPath}`],
      tagsFilter: {
        include: ["forced-colors-only"],
        exclude: [],
        skip: [],
      },
    });
    return {
      ...transformed,
      code: forceExecuteTransformedStories(transformed.code),
    };
  },
};

export default defineConfig({
  optimizeDeps: {
    exclude: ["@mypoint/tokens"],
    include: [
      "@storybook/addon-vitest/internal/test-utils",
      "markdown-to-jsx",
      "react/jsx-dev-runtime",
    ],
  },
  plugins: [forcedColorsStoryTransform, tailwindcss()],
  resolve: {
    alias: [
      ...workspaceAliases,
      ...workspaceTokenCssAliases,
      {
        find: /^@mypoint\/ui$/,
        replacement: fileURLToPath(
          new URL("./packages/ui/src/index.ts", import.meta.url),
        ),
      },
      {
        find: /^@mypoint\/retail-ui$/,
        replacement: fileURLToPath(
          new URL("./packages/retail-ui/src/index.ts", import.meta.url),
        ),
      },
    ],
  },
  test: {
    name: "textarea-forced-colors",
    fileParallelism: false,
    include: [storyPath],
    browser: {
      enabled: true,
      provider: "playwright",
      headless: true,
      instances: [
        {
          browser: "chromium",
          context: { forcedColors: "active" },
          name: "chromium-textarea-forced-colors",
        },
      ],
    },
    setupFiles: ["./apps/storybook/.storybook-test/vitest.setup.ts"],
  },
});
