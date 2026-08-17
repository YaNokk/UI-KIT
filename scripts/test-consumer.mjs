import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync
} from "node:fs";
import { resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const fixtureRoot = resolve(repositoryRoot, "fixtures", "vite-react");
const consumerRoot = resolve(repositoryRoot, ".artifacts", "consumer");
const packageRoot = resolve(repositoryRoot, ".artifacts", "packages");
const npmCache = resolve(repositoryRoot, ".artifacts", "npm-cache");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is unavailable; run this script through npm.");
const fixtureApp = readFileSync(resolve(fixtureRoot, "src", "App.tsx"), "utf8");
if (!fixtureApp.includes('from "@mypoint/ui/date-time-input"')) {
  throw new Error("Consumer fixture must exercise the DateTimeInput package subpath.");
}
if (!fixtureApp.includes('from "@mypoint/ui/date-time-picker"')) {
  throw new Error("Consumer fixture must exercise the DateTimePicker package subpath.");
}
if (!fixtureApp.includes('from "@mypoint/ui/sidebar"')) {
  throw new Error("Consumer fixture must exercise the Sidebar package subpath.");
}
if (!fixtureApp.includes('from "@mypoint/ui/notification"')) {
  throw new Error("Consumer fixture must exercise the Notification package subpath.");
}

function run(args, extraEnvironment = {}) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: consumerRoot,
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: npmCache,
      ...extraEnvironment
    },
    stdio: "inherit"
  });
  if (result.status !== 0) {
    throw new Error(`Consumer command failed: npm ${args.join(" ")}`);
  }
}

function findFiles(directory, predicate) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) files.push(...findFiles(path, predicate));
    else if (predicate(path)) files.push(path);
  }
  return files;
}

function verifyFontBuild(entry, outputDirectory, expectFonts) {
  run(
    ["run", "build", "--", "--outDir", outputDirectory],
    { TREE_SHAKING_ENTRY: entry }
  );
  const outputRoot = resolve(consumerRoot, outputDirectory);
  const fontFiles = findFiles(outputRoot, (path) => path.endsWith(".woff2"));
  const css = findFiles(outputRoot, (path) => path.endsWith(".css"))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");

  if (!expectFonts) {
    if (fontFiles.length !== 0 || css.includes("@font-face")) {
      throw new Error("The styles-only consumer unexpectedly emitted optional font assets.");
    }
    return;
  }

  const expectedNames = ["inter-regular", "inter-medium", "inter-semibold"];
  if (
    fontFiles.length !== expectedNames.length
    || expectedNames.some((name) => !fontFiles.some((path) => path.includes(name)))
    || !css.includes("@font-face")
    || fontFiles.some((path) => !css.includes(path.split(/[\\/]/).at(-1)))
  ) {
    throw new Error("The font-enabled consumer did not emit exactly the approved Inter assets with valid CSS URLs.");
  }
}

function copyDirectory(source, destination) {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const sourcePath = resolve(source, entry.name);
    const destinationPath = resolve(destination, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      copyFileSync(sourcePath, destinationPath);
    }
  }
}

if (!consumerRoot.startsWith(`${repositoryRoot}${sep}`)) {
  throw new Error("Consumer artifact path escaped the repository.");
}

const manifestPath = resolve(packageRoot, "manifest.json");
if (!existsSync(manifestPath)) {
  throw new Error("Packed artifacts are missing. Run npm run pack:check first.");
}

const artifacts = JSON.parse(readFileSync(manifestPath, "utf8"));
const tarballs = artifacts.map((artifact) => resolve(packageRoot, artifact.filename));

rmSync(consumerRoot, { recursive: true, force: true });
copyDirectory(fixtureRoot, consumerRoot);

run(["install", "--no-package-lock", "--ignore-scripts", ...tarballs]);
run(["run", "typecheck"]);
run(["run", "build"]);
verifyFontBuild("tree", "dist-fonts-off", false);
verifyFontBuild("tree-fonts", "dist-fonts-on", true);

console.log(`Packed-package consumer passed with optional font isolation in ${consumerRoot}.`);
