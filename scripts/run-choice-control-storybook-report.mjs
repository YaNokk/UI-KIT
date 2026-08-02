import {
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";
import {
  allExpectedStories,
  correctiveStories,
  expectedEnvironmentNames,
  storyFile
} from "./choice-control-storybook-manifest.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const rawReportPath = resolve(
  repositoryRoot,
  ".artifacts/choice-controls-storybook-report.json"
);
const summaryPath = resolve(
  repositoryRoot,
  ".artifacts/choice-controls-storybook-summary.json"
);
const vitestPath = resolve(repositoryRoot, "node_modules/vitest/vitest.mjs");

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

function aggregateStatus(storyExecutions) {
  if (storyExecutions.length === 0) return "missing";
  if (storyExecutions.some((execution) => execution.status === "failed")) return "failed";
  if (storyExecutions.some((execution) => execution.status !== "passed")) return "skipped";
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
  storyFile,
  "--reporter=json",
  `--outputFile=${relative(repositoryRoot, rawReportPath).replaceAll("\\", "/")}`
]);

if (currentHead() !== verifiedCommit) {
  throw new Error("HEAD changed while the Choice Control browser report was running.");
}

const rawReport = JSON.parse(readFileSync(rawReportPath, "utf8"));
const suites = rawReport.testResults.map((result, suiteIndex) => ({
  environment: expectedEnvironmentNames[suiteIndex] ?? null,
  sourceFile: result.name.replaceAll("\\", "/"),
  assertions: result.assertionResults.map((assertion) => ({
    sourceFile: result.name.replaceAll("\\", "/"),
    status: assertion.status,
    storyId: assertion.meta?.storyId,
    title: assertion.title,
    exportName: exportName(assertion.title)
  }))
}));
const executions = suites.flatMap((suite) =>
  suite.assertions.map((assertion) => ({ ...assertion, environment: suite.environment }))
);
const sourceStoryFiles = new Set(executions.map((execution) => execution.sourceFile));
const logicalStoryIds = new Set(executions.map((execution) => execution.storyId).filter(Boolean));

const correctiveStoryDetails = {};
for (const requiredName of correctiveStories) {
  const matching = executions.filter((execution) => execution.exportName === requiredName);
  const storyIds = [...new Set(matching.map((execution) => execution.storyId).filter(Boolean))];
  correctiveStoryDetails[requiredName] = {
    exportName: requiredName,
    executions: matching.length,
    status: aggregateStatus(matching),
    skipped: matching.filter((execution) => execution.status !== "passed" && execution.status !== "failed").length,
    failed: matching.filter((execution) => execution.status === "failed").length,
    storyIds,
    environments: matching.map((execution) => execution.environment).filter(Boolean)
  };
}

const logicalStoryDetails = Object.fromEntries(
  allExpectedStories.map((requiredName) => {
    const matching = executions.filter((execution) => execution.exportName === requiredName);
    return [
      requiredName,
      {
        exportName: requiredName,
        executions: matching.length,
        storyIds: [...new Set(matching.map((execution) => execution.storyId).filter(Boolean))]
      }
    ];
  })
);

const summary = {
  verifiedCommit,
  generatedAt: new Date().toISOString(),
  rawReport: relative(repositoryRoot, rawReportPath).replaceAll("\\", "/"),
  storyFile,
  sourceStoryFiles: sourceStoryFiles.size,
  logicalStories: logicalStoryIds.size,
  executions: rawReport.numTotalTests,
  skipped: rawReport.numPendingTests + rawReport.numTodoTests,
  failed: rawReport.numFailedTests,
  correctiveStories: Object.fromEntries(
    Object.entries(correctiveStoryDetails).map(([name, details]) => [name, details.status])
  ),
  correctiveStoryDetails,
  logicalStoryDetails,
  environments: expectedEnvironmentNames
};

writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
if (currentHead() !== verifiedCommit) {
  throw new Error("HEAD changed while the Choice Control evidence was being generated.");
}
console.log(`Choice Control Storybook summary written to ${summaryPath}`);
