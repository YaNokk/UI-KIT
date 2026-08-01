import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const tokens = await readFile(resolve(root, "packages/tokens/generated/tokens.css"), "utf8");
const fieldShell = await readFile(
  resolve(root, "packages/ui/src/FieldShell/FieldShell.module.css"),
  "utf8"
);
const selectTrigger = await readFile(
  resolve(root, "packages/ui/src/internal/select/SelectTrigger.module.css"),
  "utf8"
);

const requiredVariables = [
  "--ds-motion-control-state-duration",
  "--ds-motion-control-state-easing",
  "--ds-motion-control-label-duration",
  "--ds-motion-control-label-easing",
  "--ds-motion-control-indicator-duration",
  "--ds-motion-overlay-enter-duration",
  "--ds-motion-overlay-exit-duration"
];

for (const variable of requiredVariables) {
  if (!tokens.includes(variable)) throw new Error(`Missing motion variable: ${variable}`);
}

for (const duration of [
  "--ds-motion-control-state-duration: 0ms",
  "--ds-motion-control-label-duration: 0ms",
  "--ds-motion-control-indicator-duration: 0ms",
  "--ds-motion-overlay-enter-duration: 0ms",
  "--ds-motion-overlay-exit-duration: 0ms"
]) {
  if (!tokens.includes(duration)) throw new Error(`Reduced motion does not reset ${duration}`);
}

const labelTransition = fieldShell.match(/\.inner \.innerLabel \{[\s\S]*?transition:([\s\S]*?);/u)?.[1] ?? "";
for (const forbidden of ["font", "line-height", "inset-block-start", "block-size"]) {
  if (labelTransition.includes(forbidden)) {
    throw new Error(`Field label transition contains layout property: ${forbidden}`);
  }
}
if (!labelTransition.includes("transform") || !labelTransition.includes("color")) {
  throw new Error("Field label transition must contain transform and color.");
}
if (!selectTrigger.includes("--ds-motion-control-indicator-duration")) {
  throw new Error("Select chevron does not use motion.control.indicator.");
}

console.log("Motion foundation check passed.");
