import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  allExpectedStories,
  correctiveStories,
  expectedEnvironmentNames,
  storyFile
} from "./choice-control-storybook-manifest.mjs";
import { forceExecuteTransformedStories } from "./storybook-csf-transform.mjs";
import { defaultStorybookTagsFilter } from "./storybook-test-tags.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const configPath = resolve(repositoryRoot, "vitest.storybook.config.ts");
const storyPath = resolve(
  repositoryRoot,
  storyFile
);

const expectedConfigEntries = [
  {
    label: "Vite CSF transform allowlist",
    value: '"/packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx"'
  },
  {
    label: "CSF stories list",
    value: '"../../../packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx"'
  },
  {
    label: "Storybook browser include list",
    value: '"packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx"'
  }
];

function countExact(source, value) {
  return source.split(value).length - 1;
}

function assertExactCount(source, value, expected, label) {
  const count = countExact(source, value);
  if (count !== expected) {
    throw new Error(`${label} must contain ${value} exactly ${expected} time(s); found ${count}.`);
  }
}

if (!existsSync(configPath)) throw new Error(`Missing browser config: ${configPath}`);
if (!existsSync(storyPath)) throw new Error(`Missing Choice Control story file: ${storyPath}`);

const config = readFileSync(configPath, "utf8");
const story = readFileSync(storyPath, "utf8");

for (const entry of expectedConfigEntries) {
  assertExactCount(config, entry.value, 1, entry.label);
}

assert.deepEqual(defaultStorybookTagsFilter, {
  include: ["test"],
  exclude: ["forced-colors-only"],
  skip: []
});
assertExactCount(
  config,
  'import { defaultStorybookTagsFilter } from "./scripts/storybook-test-tags.mjs";',
  1,
  "Shared Storybook tag manifest import"
);
assertExactCount(
  config,
  "tagsFilter: defaultStorybookTagsFilter",
  1,
  "Shared Storybook tag filter usage"
);
assertExactCount(story, 'tags: ["test"]', 1, "Choice Control story test tag");

assert.throws(
  () => forceExecuteTransformedStories("export const story = true;"),
  /execution marker must appear exactly once; found 0/
);
assert.equal(
  forceExecuteTransformedStories(
    "before if (_isRunningFromThisFile) { after"
  ),
  "before if (true) { after"
);

for (const storyName of allExpectedStories) {
  assertExactCount(
    story,
    `export const ${storyName}: Story =`,
    1,
    `Corrective story ${storyName}`
  );
}

assertExactCount(
  config,
  'import { expectedEnvironmentNames } from "./scripts/choice-control-storybook-manifest.mjs";',
  1,
  "Shared environment manifest import"
);
for (const [index, environmentName] of expectedEnvironmentNames.entries()) {
  assertExactCount(
    config,
    `name: expectedEnvironmentNames[${index}]`,
    1,
    `Storybook environment ${environmentName}`
  );
}

console.log("Choice Control Storybook collection configuration passed.");
console.log(`Story file: ${storyPath}`);
console.log(`Corrective stories: ${correctiveStories.length}`);
for (const storyName of correctiveStories) console.log(`- ${storyName}`);
console.log(`Logical stories: ${allExpectedStories.length}`);
console.log(`Environments: ${expectedEnvironmentNames.join(", ")}`);
