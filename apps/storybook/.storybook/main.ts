import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import {
  workspaceAliases,
  workspaceTokenCssAliases,
} from "../../../vitest.workspace-aliases";

const config: StorybookConfig = {
  stories: [
    "../src/**/!(__screenshots__)/*.stories.@(ts|tsx)",
    "../../../packages/ui/src/**/!(__screenshots__)/*.stories.@(ts|tsx)",
    "../../../packages/patterns/src/**/!(__screenshots__)/*.stories.@(ts|tsx)",
    "../../../packages/retail-ui/src/**/!(__screenshots__)/*.stories.@(ts|tsx)",
    "../../../prototypes/**/!(__screenshots__)/*.stories.@(ts|tsx)"
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-mcp"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: [
          ...workspaceAliases,
          ...workspaceTokenCssAliases,
          {
            find: /^@mypoint\/ui$/,
            replacement: fileURLToPath(
              new URL("../../../packages/ui/src/index.ts", import.meta.url)
            )
          },
          {
            find: /^@mypoint\/retail-ui$/,
            replacement: fileURLToPath(
              new URL("../../../packages/retail-ui/src/index.ts", import.meta.url)
            )
          }
        ]
      }
    })
};

export default config;
