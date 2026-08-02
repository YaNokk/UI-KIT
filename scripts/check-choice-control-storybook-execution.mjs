import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const summaryPath = resolve(
  repositoryRoot,
  "docs/freeze/artifacts/choice-controls-storybook-summary.json"
);
const correctiveStories = [
  "RadioDescriptionAssociation",
  "SwitchBrandForeground",
  "GroupInvalidOwnership",
  "StandaloneFormSubmission",
  "UncontrolledIndicatorStates"
];

function fail(message) {
  throw new Error(`Choice Control Storybook execution check failed: ${message}`);
}

function currentHead() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  });
  if (result.status !== 0) fail("could not resolve current HEAD.");
  return result.stdout.trim();
}

if (!existsSync(summaryPath)) fail(`report is missing: ${summaryPath}`);
const summary = JSON.parse(readFileSync(summaryPath, "utf8"));

if (!summary.verifiedCommit) fail("verified commit is missing.");
if (summary.verifiedCommit !== currentHead()) {
  fail(`report commit ${summary.verifiedCommit} differs from current HEAD ${currentHead()}.`);
}
if (!Number.isInteger(summary.executions) || summary.executions <= 0) {
  fail("zero tests were executed.");
}
if (summary.failed !== 0) fail(`${summary.failed} unexpected execution(s) failed.`);
if (summary.skipped !== 0) fail(`${summary.skipped} execution(s) were skipped unexpectedly.`);
if (!Array.isArray(summary.environments) || summary.environments.length === 0) {
  fail("browser environments are missing.");
}

for (const storyName of correctiveStories) {
  const status = summary.correctiveStories?.[storyName];
  const details = summary.correctiveStoryDetails?.[storyName];
  if (!status || !details) fail(`corrective story ${storyName} is missing.`);
  if (status !== "passed") fail(`corrective story ${storyName} is ${status}.`);
  if (!Array.isArray(details.storyIds) || details.storyIds.length !== 1) {
    fail(`corrective story ${storyName} does not resolve to exactly one runtime story ID.`);
  }
  if (details.executions !== summary.environments.length) {
    fail(
      `corrective story ${storyName} executed ${details.executions} time(s), expected ${summary.environments.length}.`
    );
  }
}

console.log("Choice Control Storybook execution report passed.");
console.log(`Verified commit: ${summary.verifiedCommit}`);
console.log(`Executions: ${summary.executions}; skipped: ${summary.skipped}; failed: ${summary.failed}`);
for (const storyName of correctiveStories) {
  const details = summary.correctiveStoryDetails[storyName];
  console.log(`- ${details.storyIds[0]}: ${details.status} (${details.executions})`);
}
