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

export const workspaceTokenCssAliases = [
  {
    find: /^@mypoint\/tokens\/tokens\.css$/,
    replacement: fileURLToPath(
      new URL("./packages/tokens/generated/tokens.css", import.meta.url),
    ),
  },
  {
    find: /^@mypoint\/tokens\/responsive\.css$/,
    replacement: fileURLToPath(
      new URL("./packages/tokens/generated/responsive.css", import.meta.url),
    ),
  },
  {
    find: /^@mypoint\/tokens\/tailwind\.css$/,
    replacement: fileURLToPath(
      new URL("./packages/tokens/generated/tailwind.css", import.meta.url),
    ),
  },
] satisfies AliasOptions;
