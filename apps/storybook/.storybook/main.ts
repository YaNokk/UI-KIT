import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(ts|tsx)",
    "../../../packages/ui/src/**/*.stories.@(ts|tsx)",
    "../../../packages/patterns/src/**/*.stories.@(ts|tsx)",
    "../../../packages/retail-ui/src/**/*.stories.@(ts|tsx)",
    "../../../prototypes/**/*.stories.@(ts|tsx)"
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
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
          {
            find: /^@mypoint\/tokens$/,
            replacement: fileURLToPath(
              new URL("../../../packages/tokens/src/index.ts", import.meta.url)
            )
          },
          {
            find: /^@mypoint\/tokens\/tokens\.css$/,
            replacement: fileURLToPath(
              new URL("../../../packages/tokens/generated/tokens.css", import.meta.url)
            )
          },
          {
            find: /^@mypoint\/ui$/,
            replacement: fileURLToPath(
              new URL("../../../packages/ui/src/index.ts", import.meta.url)
            )
          }
        ]
      }
    })
};

export default config;
