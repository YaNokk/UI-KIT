import assert from "node:assert/strict";
import { validateChoiceControlStorybookEvidence } from "./check-choice-control-storybook-execution.mjs";
import {
  allExpectedStories,
  correctiveStories,
  expectedEnvironmentNames,
  storyFile
} from "./choice-control-storybook-manifest.mjs";

const head = "0123456789abcdef0123456789abcdef01234567";
const titleByExport = {
  RadioDescriptionAssociation: "Radio Description Association",
  SwitchBrandForeground: "Switch Brand Foreground",
  GroupInvalidOwnership: "Group Invalid Ownership",
  StandaloneFormSubmission: "Standalone Form Submission",
  UncontrolledIndicatorStates: "Uncontrolled Indicator States",
  NativeInteraction: "Native Interaction",
  GroupsAndForms: "Groups And Forms",
  GeometryThemeAndMedia: "Geometry Theme And Media"
};

function storyId(exportName) {
  return `foundations-choicecontrolbrowserregression--${titleByExport[exportName]
    .toLowerCase()
    .replaceAll(" ", "-")}`;
}

function validEvidence() {
  const testResults = expectedEnvironmentNames.map(() => ({
    name: `C:/repository/${storyFile}`,
    assertionResults: allExpectedStories.map((exportName) => ({
      title: titleByExport[exportName],
      status: "passed",
      meta: { storyId: storyId(exportName) }
    }))
  }));
  const logicalStoryDetails = Object.fromEntries(
    allExpectedStories.map((exportName) => [
      exportName,
      {
        exportName,
        executions: expectedEnvironmentNames.length,
        storyIds: [storyId(exportName)]
      }
    ])
  );
  const correctiveStoryDetails = Object.fromEntries(
    correctiveStories.map((exportName) => [
      exportName,
      {
        ...logicalStoryDetails[exportName],
        status: "passed",
        skipped: 0,
        failed: 0,
        environments: [...expectedEnvironmentNames]
      }
    ])
  );
  return {
    summary: {
      verifiedCommit: head,
      generatedAt: "2026-08-02T12:00:01.000Z",
      rawReport: ".artifacts/choice-controls-storybook-report.json",
      storyFile,
      sourceStoryFiles: 1,
      logicalStories: allExpectedStories.length,
      executions: allExpectedStories.length * expectedEnvironmentNames.length,
      skipped: 0,
      failed: 0,
      correctiveStories: Object.fromEntries(correctiveStories.map((name) => [name, "passed"])),
      correctiveStoryDetails,
      logicalStoryDetails,
      environments: [...expectedEnvironmentNames]
    },
    rawReport: {
      startTime: Date.parse("2026-08-02T12:00:00.000Z"),
      numTotalTests: allExpectedStories.length * expectedEnvironmentNames.length,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      testResults
    }
  };
}

function clone(value) {
  return structuredClone(value);
}

const base = validEvidence();
validateChoiceControlStorybookEvidence(base.summary, base.rawReport, head);

const negativeCases = [
  ["missing summary", ({ rawReport }) => [null, rawReport, head]],
  ["missing raw report", ({ summary }) => [summary, null, head]],
  ["stale SHA", ({ summary, rawReport }) => [{ ...summary, verifiedCommit: "stale" }, rawReport, head]],
  ["invalid timestamp", ({ summary, rawReport }) => [{ ...summary, generatedAt: "invalid" }, rawReport, head]],
  ["zero executions", ({ summary, rawReport }) => [{ ...summary, executions: 0 }, rawReport, head]],
  ["missing corrective story", ({ summary, rawReport }) => {
    delete summary.correctiveStories.RadioDescriptionAssociation;
    delete summary.correctiveStoryDetails.RadioDescriptionAssociation;
    return [summary, rawReport, head];
  }],
  ["failed corrective story", ({ summary, rawReport }) => {
    summary.correctiveStories.RadioDescriptionAssociation = "failed";
    summary.correctiveStoryDetails.RadioDescriptionAssociation.status = "failed";
    summary.correctiveStoryDetails.RadioDescriptionAssociation.failed = 1;
    return [summary, rawReport, head];
  }],
  ["skipped corrective story", ({ summary, rawReport }) => {
    summary.correctiveStories.RadioDescriptionAssociation = "skipped";
    summary.correctiveStoryDetails.RadioDescriptionAssociation.status = "skipped";
    summary.correctiveStoryDetails.RadioDescriptionAssociation.skipped = 1;
    return [summary, rawReport, head];
  }],
  ["wrong environment count", ({ summary, rawReport }) => {
    summary.environments.pop();
    return [summary, rawReport, head];
  }],
  ["wrong logical story count", ({ summary, rawReport }) => [{ ...summary, logicalStories: 7 }, rawReport, head]],
  ["duplicate story ID", ({ summary, rawReport }) => {
    for (const suite of rawReport.testResults) {
      suite.assertionResults.find((entry) => entry.title === "Groups And Forms").meta.storyId =
        storyId("NativeInteraction");
    }
    return [summary, rawReport, head];
  }],
  ["missing story ID", ({ summary, rawReport }) => {
    delete rawReport.testResults[0].assertionResults[0].meta.storyId;
    return [summary, rawReport, head];
  }],
  ["ambiguous story ID", ({ summary, rawReport }) => {
    rawReport.testResults[0].assertionResults[0].meta.storyId = "unexpected-runtime-id";
    return [summary, rawReport, head];
  }],
  ["incomplete corrective execution count", ({ summary, rawReport }) => {
    summary.correctiveStoryDetails.RadioDescriptionAssociation.executions = 2;
    return [summary, rawReport, head];
  }]
];

for (const [name, mutate] of negativeCases) {
  const evidence = clone(base);
  assert.throws(
    () => validateChoiceControlStorybookEvidence(...mutate(evidence)),
    Error,
    `${name} must fail validation`
  );
  console.log(`PASS negative fixture: ${name}`);
}

console.log(`Choice Control execution verifier fixtures passed: ${negativeCases.length}/${negativeCases.length}.`);
