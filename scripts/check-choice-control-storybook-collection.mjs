import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const configPath = resolve(repositoryRoot, "vitest.storybook.config.ts");
const storyPath = resolve(
  repositoryRoot,
  "packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx"
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

const correctiveStories = [
  "RadioDescriptionAssociation",
  "SwitchBrandForeground",
  "GroupInvalidOwnership",
  "StandaloneFormSubmission",
  "UncontrolledIndicatorStates"
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

assertExactCount(
  config,
  'tagsFilter: { include: ["test"], exclude: [], skip: [] }',
  1,
  "Storybook test tag filter"
);
assertExactCount(story, 'tags: ["test"]', 1, "Choice Control story test tag");

for (const storyName of correctiveStories) {
  assertExactCount(
    story,
    `export const ${storyName}: Story =`,
    1,
    `Corrective story ${storyName}`
  );
}

console.log("Choice Control Storybook collection configuration passed.");
console.log(`Story file: ${storyPath}`);
console.log(`Corrective stories: ${correctiveStories.length}`);
for (const storyName of correctiveStories) console.log(`- ${storyName}`);
