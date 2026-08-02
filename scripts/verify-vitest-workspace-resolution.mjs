import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveConfig } from "vite";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const expectedTokenSource = path.normalize(
  path.join(repositoryRoot, "packages/tokens/src/index.ts"),
);
const importer = path.join(
  repositoryRoot,
  "packages/ui/src/internal/select/useSelectPresentation.ts",
);
const configFiles = [
  "vitest.select-state.config.ts",
  "vitest.choice-controls-state.config.ts",
  "vitest.storybook.config.ts",
];

for (const configFile of configFiles) {
  const config = await resolveConfig(
    {
      configFile: path.join(repositoryRoot, configFile),
      mode: "test",
    },
    "serve",
  );
  const resolve = config.createResolver();
  const tokenEntry = await resolve("@mypoint/tokens", importer);

  assert.equal(
    path.normalize(tokenEntry ?? ""),
    expectedTokenSource,
    `${configFile} must resolve @mypoint/tokens from workspace source`,
  );

  const tokenCss = await resolve("@mypoint/tokens/tokens.css", importer);
  assert.notEqual(
    path.normalize(tokenCss ?? ""),
    expectedTokenSource,
    `${configFile} must not redirect token CSS subpaths to the JavaScript entry`,
  );
}

console.log(
  `Workspace test resolution passed for ${configFiles.length} Vitest configs.`,
);
