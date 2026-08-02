import {
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const rawReportPath = resolve(
  repositoryRoot,
  ".artifacts/choice-controls-storybook-report.json"
);
const summaryPath = resolve(
  repositoryRoot,
  "docs/freeze/artifacts/choice-controls-storybook-summary.json"
);
const storyPath = "packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx";
const vitestPath = resolve(repositoryRoot, "node_modules/vitest/vitest.mjs");
const browserConfigPath = resolve(repositoryRoot, "vitest.storybook.config.ts");

const correctiveStories = [
  "RadioDescriptionAssociation",
  "SwitchBrandForeground",
  "GroupInvalidOwnership",
  "StandaloneFormSubmission",
  "UncontrolledIndicatorStates"
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit"
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}.`);
  }
  return result.stdout?.trim() ?? "";
}

function currentHead() {
  return run("git", ["rev-parse", "HEAD"], { capture: true });
}

function exportName(title) {
  return title.replace(/[^a-zA-Z0-9]+(.)?/g, (_match, next = "") => next.toUpperCase());
}

function aggregateStatus(executions) {
  if (executions.some((execution) => execution.status === "failed")) return "failed";
  if (executions.some((execution) => execution.status !== "passed")) return "skipped";
  return "passed";
}

const verifiedCommit = currentHead();
mkdirSync(resolve(rawReportPath, ".."), { recursive: true });
mkdirSync(resolve(summaryPath, ".."), { recursive: true });

run(process.execPath, [
  vitestPath,
  "--config",
  "vitest.storybook.config.ts",
  "--run",
  storyPath,
  "--reporter=json",
  `--outputFile=${relative(repositoryRoot, rawReportPath).replaceAll("\\", "/")}`
]);

if (currentHead() !== verifiedCommit) {
  throw new Error("HEAD changed while the Choice Control browser report was running.");
}

const rawReport = JSON.parse(readFileSync(rawReportPath, "utf8"));
const executions = rawReport.testResults.flatMap((result) =>
  result.assertionResults.map((assertion) => ({
    sourceFile: result.name.replaceAll("\\", "/"),
    status: assertion.status,
    storyId: assertion.meta?.storyId,
    title: assertion.title
  }))
);
const sourceStoryFiles = new Set(executions.map((execution) => execution.sourceFile));
const logicalStoryIds = new Set(executions.map((execution) => execution.storyId).filter(Boolean));
const browserConfig = readFileSync(browserConfigPath, "utf8");
const environments = [...browserConfig.matchAll(/name:\s*"(chromium[^"]*)"/g)]
  .map((match) => match[1]);

const correctiveStoryDetails = {};
for (const requiredName of correctiveStories) {
  const matching = executions.filter((execution) => exportName(execution.title) === requiredName);
  const storyIds = [...new Set(matching.map((execution) => execution.storyId).filter(Boolean))];
  correctiveStoryDetails[requiredName] = {
    executions: matching.length,
    status: aggregateStatus(matching),
    storyIds
  };
}

const summary = {
  verifiedCommit,
  rawReport: relative(repositoryRoot, rawReportPath).replaceAll("\\", "/"),
  storyFile: storyPath,
  sourceStoryFiles: sourceStoryFiles.size,
  logicalStories: logicalStoryIds.size,
  executions: rawReport.numTotalTests,
  skipped: rawReport.numPendingTests + rawReport.numTodoTests,
  failed: rawReport.numFailedTests,
  correctiveStories: Object.fromEntries(
    Object.entries(correctiveStoryDetails).map(([name, details]) => [name, details.status])
  ),
  correctiveStoryDetails,
  environments
};

writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(`Choice Control Storybook summary written to ${summaryPath}`);
