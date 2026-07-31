import type { StorybookConfig } from "@storybook/react-vite";
import baseConfig from "../.storybook/main";

const config: StorybookConfig = {
  ...baseConfig,
  stories: [
    "../../../packages/ui/src/FieldShell/InnerLabelBrowserRegression.stories.tsx",
    "../../../packages/ui/src/internal/select/SelectMultiSelectBrowserRegression.stories.tsx"
  ]
};

export default config;
