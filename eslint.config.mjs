import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { noIconAntiPatterns } from "./eslint-rules/no-icon-anti-patterns.mjs";
import { noDesignLiterals } from "./eslint-rules/no-design-literals.mjs";
import { noProductionPrototypeImports } from "./eslint-rules/no-production-prototype-imports.mjs";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/generated/**",
      ".artifacts/**",
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
    files: [
      "apps/**/*.{js,mjs,cjs,ts,tsx,mts,mtsx}",
      "packages/**/*.{js,mjs,cjs,ts,tsx,mts,mtsx}"
    ],
    plugins: {
      architecture: {
        rules: {
          "no-production-prototype-imports": noProductionPrototypeImports
        }
      }
    },
    rules: {
      "architecture/no-production-prototype-imports": "error"
    }
  },
  {
    files: ["packages/ui/src/**/*.{ts,tsx}"],
    plugins: {
      "design-system": {
        rules: {
          "no-design-literals": noDesignLiterals,
          "no-icon-anti-patterns": noIconAntiPatterns
        }
      }
    },
    rules: {
      "design-system/no-design-literals": "error",
      "design-system/no-icon-anti-patterns": "error",
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
  },
  {
    files: ["packages/ui/src/internal/modal/ModalPrimitive.tsx"],
    rules: {
      "no-restricted-imports": "off"
    }
  }
);
