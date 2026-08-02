import { fileURLToPath } from "node:url";
import type { AliasOptions } from "vite";

export const workspaceAliases = [
  {
    find: /^@mypoint\/tokens$/,
    replacement: fileURLToPath(
      new URL("./packages/tokens/src/index.ts", import.meta.url),
    ),
  },
] satisfies AliasOptions;
