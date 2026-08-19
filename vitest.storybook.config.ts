/// <reference types="@vitest/browser/providers/playwright" />

import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { vitestTransform } from "storybook/internal/csf-tools";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { expectedEnvironmentNames } from "./scripts/choice-control-storybook-manifest.mjs";
import { forceExecuteTransformedStories } from "./scripts/storybook-csf-transform.mjs";
import { defaultStorybookTagsFilter } from "./scripts/storybook-test-tags.mjs";
import {
  workspaceAliases,
  workspaceTokenCssAliases,
} from "./vitest.workspace-aliases";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const storybookConfigDir = path.join(dirname, "apps/storybook/.storybook-test");
function normalizePath(value: string) {
  return value.replaceAll("\\", "/");
}

// addon-vitest 9.1.20's generated import.meta.url guard does not match the
// Vitest worker path in this Windows workspace (Unicode + spaces). Keep the
// compatibility transform scoped to the selected CI-only regression stories.
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
        "/packages/ui/src/Alert/Alert.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/ActionMenu/ActionMenu.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/FieldShell/InnerLabelClickBehavior.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/DesignSystemProvider/DesignSystemProvider.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/FieldShell/InnerLabelGeometry.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/select/SelectMultiSelectBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/select/SharedFloatingTriggerBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/modal/ModalLayeringBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/modal/ModalFoundation.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/Drawer/DrawerChrome.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/system-color/SystemColorBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/system-color/SystemColorContrastBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/single-line-control-typography/SingleLineControlTypography.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/choice-control/ChoiceControlsVisualCalibration.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/InternationalPhoneInput/InternationalPhoneInputBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/Textarea/TextareaBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/DatePicker/DatePickerBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/DateRangePicker/DateRangePickerBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/DateTimeRangePicker/DateTimeRangePickerBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/DateTimePicker/DateTimePickerBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/internal/calendar/CalendarBrowserRegression.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/DataTable/DataTable.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/Pagination/Pagination.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/Sidebar/Sidebar.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/Notification/Notification.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/ui/src/styles/Scrollbar.stories.tsx"
      )
      && !normalizedId.includes(
        "/packages/patterns/src/DataTablePatterns.stories.tsx"
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
        "../../../packages/ui/src/Alert/Alert.stories.tsx",
        "../../../packages/ui/src/ActionMenu/ActionMenu.stories.tsx",
        "../../../packages/ui/src/DesignSystemProvider/DesignSystemProvider.stories.tsx",
        "../../../packages/ui/src/FieldShell/InnerLabelBrowserRegression.stories.tsx",
        "../../../packages/ui/src/FieldShell/InnerLabelClickBehavior.stories.tsx",
        "../../../packages/ui/src/FieldShell/InnerLabelGeometry.stories.tsx",
        "../../../packages/ui/src/internal/select/SelectMultiSelectBrowserRegression.stories.tsx",
        "../../../packages/ui/src/internal/select/SharedFloatingTriggerBrowserRegression.stories.tsx",
        "../../../packages/ui/src/internal/modal/ModalLayeringBrowserRegression.stories.tsx",
        "../../../packages/ui/src/internal/modal/ModalFoundation.stories.tsx",
        "../../../packages/ui/src/Drawer/DrawerChrome.stories.tsx",
        "../../../packages/ui/src/internal/system-color/SystemColorBrowserRegression.stories.tsx",
        "../../../packages/ui/src/internal/system-color/SystemColorContrastBrowserRegression.stories.tsx",
        "../../../packages/ui/src/internal/single-line-control-typography/SingleLineControlTypography.stories.tsx",
        "../../../packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx",
        "../../../packages/ui/src/internal/choice-control/ChoiceControlsVisualCalibration.stories.tsx",
        "../../../packages/ui/src/InternationalPhoneInput/InternationalPhoneInputBrowserRegression.stories.tsx",
        "../../../packages/ui/src/Textarea/TextareaBrowserRegression.stories.tsx",
        "../../../packages/ui/src/DatePicker/DatePickerBrowserRegression.stories.tsx",
        "../../../packages/ui/src/DateRangePicker/DateRangePickerBrowserRegression.stories.tsx",
        "../../../packages/ui/src/DateTimeRangePicker/DateTimeRangePickerBrowserRegression.stories.tsx",
        "../../../packages/ui/src/DateTimePicker/DateTimePickerBrowserRegression.stories.tsx",
        "../../../packages/ui/src/internal/calendar/CalendarBrowserRegression.stories.tsx",
        "../../../packages/ui/src/DataTable/DataTable.stories.tsx",
        "../../../packages/ui/src/Pagination/Pagination.stories.tsx",
        "../../../packages/ui/src/Sidebar/Sidebar.stories.tsx",
        "../../../packages/ui/src/Notification/Notification.stories.tsx",
        "../../../packages/ui/src/styles/Scrollbar.stories.tsx",
        "../../../packages/patterns/src/DataTablePatterns.stories.tsx"
      ],
      tagsFilter: defaultStorybookTagsFilter
    });

    return {
      ...transformed,
      code: forceExecuteTransformedStories(transformed.code)
    };
  }
};

export default defineConfig({
  optimizeDeps: {
    exclude: ["@mypoint/tokens"],
    include: [
      "@storybook/addon-vitest/internal/test-utils",
      "@radix-ui/react-focus-scope",
      "aria-hidden",
      "markdown-to-jsx",
      "react/jsx-dev-runtime",
      "tabbable"
    ]
  },
  plugins: [storybookCsfTransform, tailwindcss()],
  resolve: {
    alias: [
      ...workspaceAliases,
      ...workspaceTokenCssAliases,
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
      "packages/ui/src/Alert/Alert.stories.tsx",
      "packages/ui/src/ActionMenu/ActionMenu.stories.tsx",
      "packages/ui/src/DesignSystemProvider/DesignSystemProvider.stories.tsx",
      "packages/ui/src/FieldShell/InnerLabelBrowserRegression.stories.tsx",
      "packages/ui/src/FieldShell/InnerLabelClickBehavior.stories.tsx",
      "packages/ui/src/FieldShell/InnerLabelGeometry.stories.tsx",
      "packages/ui/src/internal/select/SelectMultiSelectBrowserRegression.stories.tsx",
      "packages/ui/src/internal/select/SharedFloatingTriggerBrowserRegression.stories.tsx",
      "packages/ui/src/internal/modal/ModalLayeringBrowserRegression.stories.tsx",
      "packages/ui/src/internal/modal/ModalFoundation.stories.tsx",
      "packages/ui/src/Drawer/DrawerChrome.stories.tsx",
      "packages/ui/src/internal/system-color/SystemColorBrowserRegression.stories.tsx",
      "packages/ui/src/internal/system-color/SystemColorContrastBrowserRegression.stories.tsx",
      "packages/ui/src/internal/single-line-control-typography/SingleLineControlTypography.stories.tsx",
      "packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx",
      "packages/ui/src/internal/choice-control/ChoiceControlsVisualCalibration.stories.tsx",
      "packages/ui/src/InternationalPhoneInput/InternationalPhoneInputBrowserRegression.stories.tsx",
      "packages/ui/src/Textarea/TextareaBrowserRegression.stories.tsx",
      "packages/ui/src/DatePicker/DatePickerBrowserRegression.stories.tsx",
      "packages/ui/src/DateRangePicker/DateRangePickerBrowserRegression.stories.tsx",
      "packages/ui/src/DateTimeRangePicker/DateTimeRangePickerBrowserRegression.stories.tsx",
      "packages/ui/src/DateTimePicker/DateTimePickerBrowserRegression.stories.tsx",
      "packages/ui/src/internal/calendar/CalendarBrowserRegression.stories.tsx",
      "packages/ui/src/DataTable/DataTable.stories.tsx",
      "packages/ui/src/Pagination/Pagination.stories.tsx",
      "packages/ui/src/Sidebar/Sidebar.stories.tsx",
      "packages/ui/src/Notification/Notification.stories.tsx",
      "packages/ui/src/styles/Scrollbar.stories.tsx",
      "packages/patterns/src/DataTablePatterns.stories.tsx"
    ],
    browser: {
      enabled: true,
      // Keep the browser API outside Windows/Hyper-V dynamic exclusion ranges.
      api: { host: "127.0.0.1", port: 64000 },
      provider: "playwright",
      headless: true,
      instances: [
        {
          browser: "chromium",
          name: expectedEnvironmentNames[0]
        },
        {
          browser: "chromium",
          context: { forcedColors: "active" },
          name: expectedEnvironmentNames[1]
        },
        {
          browser: "chromium",
          context: { reducedMotion: "reduce" },
          name: expectedEnvironmentNames[2]
        }
      ]
    },
    setupFiles: ["./apps/storybook/.storybook-test/vitest.setup.ts"]
  }
});
