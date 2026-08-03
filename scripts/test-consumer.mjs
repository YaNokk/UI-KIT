import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync
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

function run(args) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: consumerRoot,
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: npmCache
    },
    stdio: "inherit"
  });
  if (result.status !== 0) {
    throw new Error(`Consumer command failed: npm ${args.join(" ")}`);
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

console.log(`Packed-package consumer passed in ${consumerRoot}.`);
