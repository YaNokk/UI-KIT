import {
  existsSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const environmentPath = resolve(repositoryRoot, ".env");
const npmrcPath = resolve(repositoryRoot, ".npmrc");

function loadLocalEnvironment() {
  if (!existsSync(environmentPath)) return;

  for (const line of readFileSync(environmentPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }
}

loadLocalEnvironment();

const publishMode = process.argv.includes("--publish");
const tokenVariable = publishMode ? "NPM_PUBLISH_TOKEN" : "NPM_READ_TOKEN";
const host = process.env.GITLAB_HOST;
const projectId = process.env.GITLAB_PROJECT_ID;
const scope = process.env.NPM_SCOPE;
const token = process.env[tokenVariable];

if (!host || !projectId || !scope || !token) {
  throw new Error(
    `Missing registry configuration. Required: GITLAB_HOST, GITLAB_PROJECT_ID, NPM_SCOPE, ${tokenVariable}.`
  );
}
if (!/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) {
  throw new Error("GITLAB_HOST must not include a protocol or path.");
}
if (!/^\d+$/.test(projectId)) {
  throw new Error("GITLAB_PROJECT_ID must be numeric.");
}
if (!/^@[a-z0-9][a-z0-9._-]*$/i.test(scope)) {
  throw new Error("NPM_SCOPE must be a valid scoped npm prefix such as @mypoint.");
}
if (existsSync(npmrcPath)) {
  throw new Error("Refusing to overwrite an existing .npmrc.");
}

const registry = `https://${host}/api/v4/projects/${projectId}/packages/npm/`;
const authPath = `//${host}/api/v4/projects/${projectId}/packages/npm/`;
writeFileSync(
  npmrcPath,
  [
    `${scope}:registry=${registry}`,
    `${authPath}:_authToken=${token}`,
    "always-auth=true",
    ""
  ].join("\n"),
  { encoding: "utf8", mode: 0o600 }
);

console.log(`Configured ${scope} registry at ${registry}. Token was not printed.`);
