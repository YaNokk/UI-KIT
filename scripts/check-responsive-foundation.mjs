import { readdir, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const tokenSourcePath = resolve(
  repositoryRoot,
  "packages/tokens/src/primitive/primitive.tokens.json"
);
const productionRoot = resolve(repositoryRoot, "packages/ui/src");

const productionExtensions = new Set([".css", ".ts", ".tsx"]);

async function productionFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return productionFiles(path);
      if (
        !productionExtensions.has(extname(entry.name))
        || /\.(?:stories|test)\./.test(entry.name)
      ) {
        return [];
      }
      return [path];
    })
  );
  return nested.flat();
}

const tokenSource = JSON.parse(await readFile(tokenSourcePath, "utf8"));
const md = tokenSource.breakpoint?.md?.$value;
if (
  !md
  || typeof md !== "object"
  || md.unit !== "px"
  || typeof md.value !== "number"
) {
  throw new Error("breakpoint.md must be a canonical pixel dimension.");
}

const canonicalLiteral = `${md.value}${md.unit}`;
const escapedLiteral = canonicalLiteral.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const rawResponsiveCondition = new RegExp(
  `@media[^\\{]*(?:width|min-width|max-width)[^\\{]*${escapedLiteral}`,
  "i"
);
const rawMatchMediaCondition = new RegExp(
  `matchMedia\\s*\\(\\s*[\`"'][^\`"']*${escapedLiteral}`,
  "i"
);
const violations = [];

for (const path of await productionFiles(productionRoot)) {
  const source = await readFile(path, "utf8");
  if (
    !rawResponsiveCondition.test(source)
    && !rawMatchMediaCondition.test(source)
  ) {
    continue;
  }
  const relativePath = path.slice(repositoryRoot.length + 1);
  violations.push(relativePath);
}

if (violations.length > 0) {
  console.error(
    [
      `Raw canonical breakpoint ${canonicalLiteral} found in production media conditions:`,
      ...violations.map((path) => `- ${path}`),
      "Use a generated responsive artifact from @mypoint/tokens."
    ].join("\n")
  );
  process.exitCode = 1;
}
