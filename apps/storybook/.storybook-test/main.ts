import type { StorybookConfig } from "@storybook/react-vite";
import baseConfig from "../.storybook/main";

const config: StorybookConfig = {
  ...baseConfig,
  stories: [
    "../../../packages/ui/src/FieldShell/InnerLabelBrowserRegression.stories.tsx"
  ]
};

export default config;
