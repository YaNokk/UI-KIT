import { readdir, readFile } from "node:fs/promises";
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

async function collectProductionCss(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (!["dist", "generated", "node_modules"].includes(entry.name)) {
        files.push(...await collectProductionCss(path));
      }
    } else if (
      entry.name.endsWith(".css")
      && !entry.name.endsWith(".stories.module.css")
    ) {
      files.push(path);
    }
  }
  return files;
}

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

if (
  !tokens.includes(
    "--ds-motion-control-label-easing: var(--ds-motion-easing-standard)"
  )
) {
  throw new Error("motion.control.label must use the non-overshooting standard easing.");
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

const productionCss = (
  await Promise.all([
    collectProductionCss(resolve(root, "packages/ui/src")),
    collectProductionCss(resolve(root, "packages/retail-ui/src")),
    collectProductionCss(resolve(root, "packages/patterns/src")),
    collectProductionCss(resolve(root, "apps"))
  ])
).flat();
const spinnerPath = resolve(root, "packages/ui/src/Spinner/Spinner.module.css");
const violations = [];

for (const path of productionCss) {
  const css = await readFile(path, "utf8");
  const relativePath = path.slice(root.length + 1).replaceAll("\\", "/");
  const checks = [
    ["legacy motion variable", /--ds-motion-(?:fast|normal|slow)\b/u],
    ["hardcoded duration", /(?:^|[^\w-])\d+(?:\.\d+)?ms\b/u],
    ["hardcoded easing", /\b(?:ease|ease-in|ease-out|ease-in-out|cubic-bezier\s*\()/u]
  ];

  if (path !== spinnerPath) {
    checks.push(
      ["primitive motion bypass", /--ds-motion-(?:duration|easing)-/u],
      ["undocumented linear easing", /\banimation(?:-timing-function)?\s*:[^;{}]*\blinear\b/u]
    );
  }

  for (const [description, pattern] of checks) {
    if (pattern.test(css)) violations.push(`${relativePath}: ${description}`);
  }
}

if (violations.length > 0) {
  throw new Error(`Motion governance violations:\n${violations.join("\n")}`);
}

console.log("Motion foundation check passed.");
