import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const consumerRoot = resolve(repositoryRoot, ".artifacts", "consumer");
const npmCache = resolve(repositoryRoot, ".artifacts", "npm-cache");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is unavailable; run this script through npm.");

function runBuild(entry, outputDirectory) {
  const result = spawnSync(
    process.execPath,
    [npmCli, "run", "build", "--", "--outDir", outputDirectory],
    {
      cwd: consumerRoot,
      env: {
        ...process.env,
        NPM_CONFIG_CACHE: npmCache,
        TREE_SHAKING_ENTRY: entry
      },
      stdio: "inherit"
    }
  );
  if (result.status !== 0) {
    throw new Error(`Tree-shaking build failed for ${entry}.`);
  }
}

function readOutput(directory, extension) {
  const assets = resolve(consumerRoot, directory, "assets");
  return readdirSync(assets)
    .filter((file) => file.endsWith(extension))
    .map((file) => readFileSync(resolve(assets, file), "utf8"))
    .join("\n");
}

if (!existsSync(resolve(consumerRoot, "node_modules", "@mypoint", "ui"))) {
  throw new Error("Consumer is not prepared. Run npm run consumer:test first.");
}

runBuild("tree", "dist-tree");
const treeJavaScript = readOutput("dist-tree", ".js");
const treeCss = readOutput("dist-tree", ".css");

if (treeJavaScript.includes("prefers-color-scheme: dark")) {
  throw new Error("Unused ThemeProvider implementation survived the Button-only build.");
}
if (!treeJavaScript.includes("aria-busy")) {
  throw new Error("The used Button implementation was not found in the consumer bundle.");
}
if (!treeCss.includes("--ds-action-primary-background")) {
  throw new Error("Required UI/token CSS was removed from the consumer bundle.");
}

runBuild("lazy", "dist-lazy");
const manifest = JSON.parse(
  readFileSync(resolve(consumerRoot, "dist-lazy", ".vite", "manifest.json"), "utf8")
);
const hasDynamicEntry = Object.values(manifest).some((entry) => entry.isDynamicEntry);
if (!hasDynamicEntry) {
  throw new Error("Dynamic @mypoint/ui/button import did not produce an async chunk.");
}

console.log("Tree-shaking passed: unused ThemeProvider removed, CSS retained, dynamic subpath split.");
