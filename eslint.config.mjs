import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { noDesignLiterals } from "./eslint-rules/no-design-literals.mjs";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/generated/**",
      "storybook-static/**",
      "docs/design-system/**",
      "references/raw/**"
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ["**/*.{ts,tsx,mts,mtsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ["packages/ui/src/**/*.{ts,tsx}"],
    plugins: {
      "design-system": {
        rules: {
          "no-design-literals": noDesignLiterals
        }
      }
    },
    rules: {
      "design-system/no-design-literals": "error",
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["@radix-ui/*", "antd", "@mui/*"],
              "message": "Third-party UI must stay behind an internal design-system API."
            }
          ]
        }
      ]
    }
  }
);
