import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";
import { workspaceAliases } from "./vitest.workspace-aliases";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "**/*.browser.test.tsx"],
    // Keep CPU-heavy jsdom suites from starving the 10,000-option
    // virtualization contract while preserving file-level parallelism.
    maxWorkers: 4,
  },
  resolve: {
    alias: [
      ...workspaceAliases,
      {
        find: /^@mypoint\/tokens\/tokens\.css$/,
        replacement: fileURLToPath(
          new URL("./packages/tokens/generated/tokens.css", import.meta.url),
        ),
      },
      {
        find: /^@mypoint\/ui\/select$/,
        replacement: fileURLToPath(
          new URL("./packages/ui/src/Select/index.ts", import.meta.url),
        ),
      },
      {
        find: /^@mypoint\/ui\/multi-select$/,
        replacement: fileURLToPath(
          new URL("./packages/ui/src/MultiSelect/index.ts", import.meta.url),
        ),
      },
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
});
