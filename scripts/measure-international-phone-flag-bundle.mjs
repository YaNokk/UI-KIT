import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { brotliCompressSync, gzipSync } from "node:zlib";
import { resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { build } from "vite";

const repositoryRoot = resolve(import.meta.dirname, "..");
const consumerRoot = resolve(repositoryRoot, ".artifacts", "consumer");
const packageArtifactRoot = resolve(repositoryRoot, ".artifacts", "packages");
const measurementRoot = resolve(repositoryRoot, ".artifacts", "flag-measure");
const packageBaselineRoot = resolve(measurementRoot, "package-baseline");
const virtualEntry = "virtual:international-phone-flag-measurement";
const npmCli = process.env.npm_execpath;

if (!npmCli) throw new Error("npm_execpath is unavailable; run through npm.");
if (!measurementRoot.startsWith(`${repositoryRoot}${sep}`)) {
  throw new Error("Flag measurement path escaped the repository.");
}

rmSync(measurementRoot, { force: true, recursive: true });
mkdirSync(measurementRoot, { recursive: true });

function collectFiles(root, extension) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && path.endsWith(extension)) files.push(path);
    }
  };
  visit(root);
  return files;
}

function copyDirectory(source, destination) {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const sourcePath = resolve(source, entry.name);
    const destinationPath = resolve(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath);
    else if (entry.isFile()) copyFileSync(sourcePath, destinationPath);
  }
}

function compressedSizes(files) {
  const bytes = Buffer.concat(files.map((file) => readFileSync(file)));
  return {
    raw: bytes.byteLength,
    gzip: gzipSync(bytes, { level: 9 }).byteLength,
    brotli: brotliCompressSync(bytes).byteLength
  };
}

function describeFiles(files, root) {
  return files.map((file) => ({
    file: file.slice(root.length + 1).replaceAll("\\", "/"),
    ...compressedSizes([file])
  }));
}

async function buildConsumer(label, stubFlags) {
  const outDir = resolve(measurementRoot, label);
  await build({
    configFile: false,
    logLevel: "error",
    plugins: [
      {
        name: "international-phone-flag-measurement-entry",
        resolveId(source) {
          return source === virtualEntry ? `\0${virtualEntry}` : null;
        },
        load(id) {
          if (id !== `\0${virtualEntry}`) return null;
          return [
            'import { jsx } from "react/jsx-runtime";',
            'import { createRoot } from "react-dom/client";',
            'import { InternationalPhoneInput } from "@mypoint/ui/international-phone-input";',
            'import "@mypoint/ui/styles.css";',
            'const host = document.createElement("div");',
            'document.body.append(host);',
            'createRoot(host).render(jsx(InternationalPhoneInput, {',
            '  "aria-label": "Measured phone",',
            '  defaultCountry: "RU"',
            '}));'
          ].join("\n");
        }
      },
      ...(stubFlags ? [{
        name: "measure-country-flag-baseline",
        enforce: "pre",
        resolveId(source) {
          return source.replaceAll("\\", "/").endsWith(
            "/internal/country-flags/CountryFlag.js"
          ) ? "\0country-flag-baseline" : null;
        },
        load(id) {
          return id === "\0country-flag-baseline"
            ? "export function CountryFlag() { return null; }"
            : null;
        }
      }] : [])
    ],
    root: consumerRoot,
    build: {
      emptyOutDir: true,
      minify: "esbuild",
      outDir,
      rollupOptions: { input: virtualEntry }
    }
  });
  return {
    directory: outDir,
    javascript: compressedSizes(collectFiles(outDir, ".js")),
    emittedAssets: describeFiles(collectFiles(outDir, ".svg"), outDir)
  };
}

const actualConsumer = await buildConsumer("consumer-with-flags", false);
const baselineConsumer = await buildConsumer("consumer-without-flags", true);

const uiPackageRoot = resolve(repositoryRoot, "packages", "ui");
mkdirSync(packageBaselineRoot, { recursive: true });
copyFileSync(
  resolve(uiPackageRoot, "README.md"),
  resolve(packageBaselineRoot, "README.md")
);
copyDirectory(
  resolve(uiPackageRoot, "dist"),
  resolve(packageBaselineRoot, "dist")
);
const baselinePackageJson = JSON.parse(readFileSync(
  resolve(uiPackageRoot, "package.json"),
  "utf8"
));
delete baselinePackageJson.dependencies?.["country-flag-icons"];
writeFileSync(
  resolve(packageBaselineRoot, "package.json"),
  `${JSON.stringify(baselinePackageJson, null, 2)}\n`,
  "utf8"
);
const baselineFlagRoot = resolve(
  packageBaselineRoot,
  "dist",
  "internal",
  "country-flags"
);
for (const file of readdirSync(baselineFlagRoot)) {
  if (file.startsWith("country-flag-registry") || file === "CountryFlag.js.map") {
    rmSync(resolve(baselineFlagRoot, file), { force: true });
  }
}
rmSync(
  resolve(packageBaselineRoot, "dist", "assets", "country-flags.sprite.svg"),
  { force: true }
);
writeFileSync(
  resolve(baselineFlagRoot, "CountryFlag.js"),
  "export function CountryFlag() { return null; }\n",
  "utf8"
);

const packResult = spawnSync(
  process.execPath,
  [npmCli, "pack", "--json", "--pack-destination", measurementRoot],
  {
    cwd: packageBaselineRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  }
);
if (packResult.status !== 0) {
  throw new Error(`Baseline npm pack failed: ${packResult.stdout}`);
}
const baselinePackReport = JSON.parse(packResult.stdout)[0];
const actualTarball = readdirSync(packageArtifactRoot).find((file) =>
  /^mypoint-ui-.*\.tgz$/.test(file)
);
if (!actualTarball || !baselinePackReport?.filename) {
  throw new Error("UI tarball measurement inputs are missing.");
}

const actualTarballSize = statSync(resolve(packageArtifactRoot, actualTarball)).size;
const baselineTarballSize = statSync(
  resolve(measurementRoot, baselinePackReport.filename)
).size;
const rootPackageJson = JSON.parse(readFileSync(
  resolve(repositoryRoot, "package.json"),
  "utf8"
));
const flagDistRoot = resolve(uiPackageRoot, "dist", "internal", "country-flags");
const flagPackageFiles = readdirSync(flagDistRoot).map((file) => ({
  file: `dist/internal/country-flags/${file}`,
  bytes: statSync(resolve(flagDistRoot, file)).size
}));
const emittedSprite = resolve(
  uiPackageRoot,
  "dist",
  "assets",
  "country-flags.sprite.svg"
);
flagPackageFiles.push({
  file: "dist/assets/country-flags.sprite.svg",
  bytes: statSync(emittedSprite).size
});
const internationalPhoneInputChunk = resolve(
  uiPackageRoot,
  "dist",
  "InternationalPhoneInput",
  "InternationalPhoneInput.js"
);

const report = {
  countryFlagIconsVersion: rootPackageJson.devDependencies["country-flag-icons"],
  internationalPhoneInputChunk: compressedSizes([internationalPhoneInputChunk]),
  consumer: {
    withFlags: actualConsumer.javascript,
    withoutFlags: baselineConsumer.javascript,
    delta: Object.fromEntries(Object.keys(actualConsumer.javascript).map((key) => [
      key,
      actualConsumer.javascript[key] - baselineConsumer.javascript[key]
    ])),
    flagRelatedEmittedAssets: actualConsumer.emittedAssets
  },
  uiTarball: {
    withFlags: actualTarballSize,
    withoutFlagsBaseline: baselineTarballSize,
    delta: actualTarballSize - baselineTarballSize,
    flagPackageFiles
  }
};

writeFileSync(
  resolve(measurementRoot, "report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8"
);
console.log(JSON.stringify(report, null, 2));
