
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@mypoint\/tokens$/, replacement: fileURLToPath(new URL("./packages/tokens/src/index.ts", import.meta.url)) },
      { find: /^@mypoint\/tokens\/tokens\.css$/, replacement: fileURLToPath(new URL("./packages/tokens/generated/tokens.css", import.meta.url)) },
      { find: /^@mypoint\/ui$/, replacement: fileURLToPath(new URL("./packages/ui/src/index.ts", import.meta.url)) },
      { find: /^@mypoint\/retail-ui$/, replacement: fileURLToPath(new URL("./packages/retail-ui/src/index.ts", import.meta.url)) }
    ]
  },
  esbuild: { target: "es2022" }
});
