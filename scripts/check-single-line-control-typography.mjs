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
const unsafeTrimming = /\b(?:text-box-trim|text-box-edge)\s*:/i;
const opticalProperty = /--control-text-optical-offset\s*:/i;
const calibratedRoles = {
  controlTextSm: "-0.25px",
  controlTextMd: "-0.25px",
  controlTextLg: "-0.5px",
  compactControlTextSm: "-0.5px",
  compactControlTextMd: "-0.25px",
  counterText: "-0.5px",
  choiceControlLabel: "-0.25px"
};

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
  const source = await readFile(file, "utf8");
  if (unsafeTrimming.test(source)) {
    violations.push(`${relative}: unsafe glyph trimming`);
  }
  if (relative === sharedFoundation) {
    for (const [role, expectedValue] of Object.entries(calibratedRoles)) {
      const blocks = [...source.matchAll(new RegExp(`\\.${role}\\s*\\{([^{}]*)\\}`, "g"))]
        .map((match) => match[1] ?? "");
      const value = blocks
        .map((block) => block.match(/--control-text-optical-offset\s*:\s*([^;]+);/)?.[1]?.trim())
        .find((candidate) => candidate !== undefined);
      if (value !== expectedValue) {
        violations.push(`${relative}: ${role} must keep the approved ${expectedValue} optical offset`);
      }
    }
    continue;
  }
  if (opticalProperty.test(source)) {
    violations.push(`${relative}: optical offset property is owned by the shared foundation`);
  }
  if (geometryAllowlist.has(relative)) continue;
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
