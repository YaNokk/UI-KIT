import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const tag = process.env.CI_COMMIT_TAG;
if (!tag || !/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
  throw new Error("Publishing requires a SemVer tag such as v0.1.0.");
}

const expectedVersion = tag.slice(1);
for (const packagePath of [
  "packages/tokens/package.json",
  "packages/ui/package.json",
  "packages/retail-ui/package.json"
]) {
  const manifest = JSON.parse(
    readFileSync(resolve(repositoryRoot, packagePath), "utf8")
  );
  if (manifest.version !== expectedVersion) {
    throw new Error(
      `${manifest.name} version ${manifest.version} does not match tag ${tag}.`
    );
  }
}

console.log(`Release tag ${tag} matches all public package versions.`);
