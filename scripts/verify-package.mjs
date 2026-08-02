import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const artifactRoot = resolve(repositoryRoot, ".artifacts", "packages");
const npmCache = resolve(repositoryRoot, ".artifacts", "npm-cache");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is unavailable; run this script through npm.");

const packages = [
  {
    name: "@mypoint/tokens",
    required: [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/responsive.css",
      "dist/tokens.css",
      "dist/tailwind.css"
    ]
  },
  {
    name: "@mypoint/ui",
    required: [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/Amount/index.js",
      "dist/Amount/index.d.ts",
      "dist/AmountInput/index.js",
      "dist/AmountInput/index.d.ts",
      "dist/Badge/index.js",
      "dist/Badge/index.d.ts",
      "dist/Button/index.js",
      "dist/Button/index.d.ts",
      "dist/ButtonLink/index.js",
      "dist/ButtonLink/index.d.ts",
      "dist/Checkbox/index.js",
      "dist/Checkbox/index.d.ts",
      "dist/CheckboxGroup/index.js",
      "dist/CheckboxGroup/index.d.ts",
      "dist/FieldShell/index.js",
      "dist/FieldShell/index.d.ts",
      "dist/FormControl/index.js",
      "dist/FormControl/index.d.ts",
      "dist/IconButton/index.js",
      "dist/IconButton/index.d.ts",
      "dist/Input/index.js",
      "dist/Input/index.d.ts",
      "dist/InternationalPhoneInput/index.js",
      "dist/InternationalPhoneInput/index.d.ts",
      "dist/internal/country-flags/CountryFlag.js",
      "dist/internal/country-flags/country-flag-registry.js",
      "dist/NumberInput/index.js",
      "dist/NumberInput/index.d.ts",
      "dist/PasswordInput/index.js",
      "dist/PasswordInput/index.d.ts",
      "dist/Radio/index.js",
      "dist/Radio/index.d.ts",
      "dist/RadioGroup/index.js",
      "dist/RadioGroup/index.d.ts",
      "dist/Portal/index.js",
      "dist/Portal/index.d.ts",
      "dist/Spinner/index.js",
      "dist/Spinner/index.d.ts",
      "dist/StatusIndicator/index.js",
      "dist/StatusIndicator/index.d.ts",
      "dist/Switch/index.js",
      "dist/Switch/index.d.ts",
      "dist/Tag/index.js",
      "dist/Tag/index.d.ts",
      "dist/system-color/index.js",
      "dist/system-color/index.d.ts",
      "dist/styles.css"
    ]
  },
  {
    name: "@mypoint/retail-ui",
    required: [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/QuantityInput/index.js",
      "dist/QuantityInput/index.d.ts",
      "dist/styles.css"
    ]
  }
];

function assertInsideRepository(path) {
  if (!path.startsWith(`${repositoryRoot}${sep}`)) {
    throw new Error(`Refusing to modify path outside repository: ${path}`);
  }
}

function runNpmPack(packageName, dryRun) {
  const args = [
    "pack",
    `--workspace=${packageName}`,
    "--json",
    "--pack-destination",
    artifactRoot
  ];
  if (dryRun) args.push("--dry-run");

  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: npmCache
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  });

  if (result.status !== 0) {
    throw new Error(
      `npm pack failed for ${packageName}.\n${result.error?.message ?? result.stdout?.trim() ?? ""}`
    );
  }

  const output = JSON.parse(result.stdout);
  const report = output[0];
  if (!report || !Array.isArray(report.files)) {
    throw new Error(`npm pack returned an unexpected report for ${packageName}.`);
  }
  return report;
}

function validateContents(packageDefinition, report) {
  const paths = report.files.map((file) => file.path);
  const unexpected = paths.filter(
    (path) =>
      path !== "package.json"
      && path !== "README.md"
      && !path.startsWith("dist/")
  );
  const forbidden = paths.filter((path) =>
    /(^|\/)(src|stories|tests|references|\.storybook|AGENTS\.md)(\/|$)/.test(path)
  );
  const missing = packageDefinition.required.filter((path) => !paths.includes(path));

  if (unexpected.length || forbidden.length || missing.length) {
    throw new Error(
      [
        `Invalid artifact for ${packageDefinition.name}.`,
        `Missing: ${missing.join(", ") || "none"}.`,
        `Unexpected: ${unexpected.join(", ") || "none"}.`,
        `Forbidden: ${forbidden.join(", ") || "none"}.`
      ].join("\n")
    );
  }
}

assertInsideRepository(artifactRoot);
rmSync(artifactRoot, { recursive: true, force: true });
mkdirSync(artifactRoot, { recursive: true });

for (const packageDefinition of packages) {
  validateContents(packageDefinition, runNpmPack(packageDefinition.name, true));
}

const packed = packages.map((packageDefinition) => {
  const report = runNpmPack(packageDefinition.name, false);
  validateContents(packageDefinition, report);
  return {
    name: packageDefinition.name,
    filename: report.filename,
    files: report.files.map((file) => file.path)
  };
});

const uiJavaScript = readFileSync(
  resolve(repositoryRoot, "packages/ui/dist/theme/ThemeProvider.js"),
  "utf8"
);
if (!/from\s+["']react["']/.test(uiJavaScript)) {
  throw new Error("React is not visibly external in the UI package output.");
}

const countryFlagRegistryJavaScript = readFileSync(
  resolve(
    repositoryRoot,
    "packages/ui/dist/internal/country-flags/country-flag-registry.js"
  ),
  "utf8"
);
if (!countryFlagRegistryJavaScript.includes("country-flag-icons/react/3x2")) {
  throw new Error("The private country flag registry is missing from the UI package.");
}
if (countryFlagRegistryJavaScript.includes("regionalIndicator")) {
  throw new Error("Unicode emoji flag generation survived in the UI package.");
}

const uiPackageJson = JSON.parse(readFileSync(
  resolve(repositoryRoot, "packages/ui/package.json"),
  "utf8"
));
if (Object.keys(uiPackageJson.exports ?? {}).some((key) => key.includes("country-flag"))) {
  throw new Error("Private country flag internals must not have a package export.");
}

writeFileSync(
  resolve(artifactRoot, "manifest.json"),
  `${JSON.stringify(packed, null, 2)}\n`,
  "utf8"
);

for (const artifact of packed) {
  console.log(`${artifact.name}: ${artifact.filename}`);
  for (const file of artifact.files) console.log(`  ${file}`);
}
