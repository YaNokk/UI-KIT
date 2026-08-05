import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const npmrcPath = resolve(repositoryRoot, ".npmrc");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is unavailable; run this script through npm.");

function run(args) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: repositoryRoot,
    stdio: "inherit"
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: npm ${args.join(" ")}`);
  }
}

if (existsSync(npmrcPath)) {
  throw new Error("Remove or relocate the existing .npmrc before manual publishing.");
}

let generatedAuthentication = false;
try {
  run(["run", "tokens:check"]);
  run(["run", "lint"]);
  run(["run", "typecheck"]);
  run(["test"]);
  run(["run", "build"]);
  run(["run", "pack:check"]);
  run(["run", "consumer:test"]);
  run(["run", "tree-shaking:test"]);
  run(["run", "registry:configure", "--", "--publish"]);
  generatedAuthentication = true;
  run(["publish", "--workspace=@mypoint/tokens", `--userconfig=${npmrcPath}`]);
  run(["publish", "--workspace=@mypoint/ui", `--userconfig=${npmrcPath}`]);
  run(["publish", "--workspace=@mypoint/retail-ui", `--userconfig=${npmrcPath}`]);
} finally {
  if (generatedAuthentication && existsSync(npmrcPath)) {
    rmSync(npmrcPath);
  }
}
