import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveConfig } from "vite";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const expectedTokenSource = path.normalize(
  path.join(repositoryRoot, "packages/tokens/src/index.ts"),
);
const tokenCssSubpaths = ["tokens.css", "responsive.css", "tailwind.css"];
const importer = path.join(
  repositoryRoot,
  "packages/ui/src/internal/select/useSelectPresentation.ts",
);
const configFiles = [
  "vitest.select-state.config.ts",
  "vitest.choice-controls-state.config.ts",
  "vitest.storybook.config.ts",
  "vitest.textarea-forced-colors.config.ts",
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

  for (const cssSubpath of tokenCssSubpaths) {
    const tokenCss = await resolve(`@mypoint/tokens/${cssSubpath}`, importer);
    assert.ok(
      tokenCss,
      `${configFile} must resolve @mypoint/tokens/${cssSubpath}`,
    );

    const normalizedTokenCss = path.normalize(tokenCss);
    const expectedTokenCss = path.normalize(
      path.join(repositoryRoot, `packages/tokens/generated/${cssSubpath}`),
    );
    assert.notEqual(
      normalizedTokenCss,
      expectedTokenSource,
      `${configFile} must not redirect ${cssSubpath} to the JavaScript entry`,
    );
    assert.equal(
      normalizedTokenCss,
      expectedTokenCss,
      `${configFile} must resolve ${cssSubpath} from generated token CSS`,
    );
  }
}

console.log(
  `Workspace test resolution passed for ${configFiles.length} Vitest configs.`,
);
