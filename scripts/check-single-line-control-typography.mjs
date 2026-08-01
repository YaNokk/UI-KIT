import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("packages/ui/src");
const sharedFoundation = path.normalize(
  "internal/single-line-control-typography/singleLineControlTypography.module.css"
);
const geometryAllowlist = new Set([
  path.normalize("FieldShell/FieldShell.module.css")
]);
const textSelector = /(label|text|value|summary|placeholder|overflow|badge|tag)/i;
const suspiciousDeclaration = /\b(?:transform\s*:\s*translateY|inset-block-start\s*:|top\s*:|padding-top\s*:)/i;

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(target) : [target];
  }));
  return nested.flat();
}

const violations = [];
for (const file of await collect(root)) {
  if (!file.endsWith(".module.css")) continue;
  const relative = path.normalize(path.relative(root, file));
  if (relative === sharedFoundation || geometryAllowlist.has(relative)) continue;
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, selector, declarations] = match;
    if (!textSelector.test(selector) || /\.arrow\b/.test(selector)) continue;
    if (suspiciousDeclaration.test(declarations)) {
      violations.push(`${relative}: ${selector.trim()}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Component-local optical text offsets are forbidden:\n" + violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Single-line control typography governance check passed.");
}
