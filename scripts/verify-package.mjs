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
      "dist/DateInput/index.js",
      "dist/DateInput/index.d.ts",
      "dist/TimeInput/index.js",
      "dist/TimeInput/index.d.ts",
      "dist/DateTimeInput/index.js",
      "dist/DateTimeInput/index.d.ts",
      "dist/DateTimePicker/index.js",
      "dist/DateTimePicker/index.d.ts",
      "dist/DatePicker/index.js",
      "dist/DatePicker/index.d.ts",
      "dist/DateRangeInput/index.js",
      "dist/DateRangeInput/index.d.ts",
      "dist/DateRangePicker/index.js",
      "dist/DateRangePicker/index.d.ts",
      "dist/DateTimeRangeInput/index.js",
      "dist/DateTimeRangeInput/index.d.ts",
      "dist/DateTimeRangePicker/index.js",
      "dist/DateTimeRangePicker/index.d.ts",
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
      "dist/assets/LICENSE-Inter.txt",
      "dist/assets/country-flags.sprite.svg",
      "dist/assets/inter-medium.woff2",
      "dist/assets/inter-regular.woff2",
      "dist/assets/inter-semibold.woff2",
      "dist/internal/country-flags/CountryFlag.js",
      "dist/internal/country-flags/country-flag-registry.js",
      "dist/NumberInput/index.js",
      "dist/NumberInput/index.d.ts",
      "dist/Notification/index.js",
      "dist/Notification/index.d.ts",
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
      "dist/Sidebar/index.js",
      "dist/Sidebar/index.d.ts",
      "dist/StatusIndicator/index.js",
      "dist/StatusIndicator/index.d.ts",
      "dist/Switch/index.js",
      "dist/Switch/index.d.ts",
      "dist/Tag/index.js",
      "dist/Tag/index.d.ts",
      "dist/Textarea/index.js",
      "dist/Textarea/index.d.ts",
      "dist/system-color/index.js",
      "dist/system-color/index.d.ts",
      "dist/fonts.css",
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

const approvedUiFontFiles = [
  "dist/assets/inter-regular.woff2",
  "dist/assets/inter-medium.woff2",
  "dist/assets/inter-semibold.woff2"
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
  const forbiddenFontFormats = packageDefinition.name === "@mypoint/ui"
    ? paths.filter((path) => /\.(?:otf|ttf|woff)$/i.test(path))
    : [];
  const unapprovedUiFonts = packageDefinition.name === "@mypoint/ui"
    ? paths.filter(
        (path) => path.endsWith(".woff2") && !approvedUiFontFiles.includes(path)
      )
    : [];

  if (
    unexpected.length
    || forbidden.length
    || missing.length
    || forbiddenFontFormats.length
    || unapprovedUiFonts.length
  ) {
    throw new Error(
      [
        `Invalid artifact for ${packageDefinition.name}.`,
        `Missing: ${missing.join(", ") || "none"}.`,
        `Unexpected: ${unexpected.join(", ") || "none"}.`,
        `Forbidden: ${forbidden.join(", ") || "none"}.`,
        `Forbidden font formats: ${forbiddenFontFormats.join(", ") || "none"}.`,
        `Unapproved UI fonts: ${unapprovedUiFonts.join(", ") || "none"}.`
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
if (countryFlagRegistryJavaScript.includes("country-flag-icons")) {
  throw new Error("The generated country flag registry retained a runtime dependency.");
}
if (countryFlagRegistryJavaScript.includes("regionalIndicator")) {
  throw new Error("Unicode emoji flag generation survived in the UI package.");
}

const uiPackageJson = JSON.parse(readFileSync(
  resolve(repositoryRoot, "packages/ui/package.json"),
  "utf8"
));
if (uiPackageJson.exports?.["./fonts.css"] !== "./dist/fonts.css") {
  throw new Error("The optional ./fonts.css public export is missing or invalid.");
}
if (uiPackageJson.dependencies?.["country-flag-icons"]) {
  throw new Error("country-flag-icons must remain a root-only generation dependency.");
}

const fontCss = readFileSync(
  resolve(repositoryRoot, "packages/ui/dist/fonts.css"),
  "utf8"
);
const fontFaceBlocks = fontCss.match(/@font-face\s*\{[^}]*\}/g) ?? [];
const contentOutsideFontFaces = fontCss.replace(/@font-face\s*\{[^}]*\}/g, "").trim();
if (fontFaceBlocks.length !== 3 || contentOutsideFontFaces !== "") {
  throw new Error("fonts.css must contain exactly three @font-face declarations.");
}
for (const [file, weight] of [
  ["inter-regular.woff2", "400"],
  ["inter-medium.woff2", "500"],
  ["inter-semibold.woff2", "600"]
]) {
  const block = fontFaceBlocks.find((candidate) => candidate.includes(file));
  if (!block || !block.includes(`font-weight: ${weight}`)) {
    throw new Error(`fonts.css is missing the approved ${weight} font face (${file}).`);
  }
}

const uiStyles = readFileSync(
  resolve(repositoryRoot, "packages/ui/dist/styles.css"),
  "utf8"
);
const uiRootJavaScript = readFileSync(
  resolve(repositoryRoot, "packages/ui/dist/index.js"),
  "utf8"
);
if (/@font-face|fonts\.css|\.woff2/i.test(uiStyles)) {
  throw new Error("styles.css must remain independent from optional font delivery.");
}
if (/fonts\.css|\.woff2/i.test(uiRootJavaScript)) {
  throw new Error("The UI JavaScript root must not import optional font delivery.");
}
if (Object.keys(uiPackageJson.exports ?? {}).some((key) => key.includes("country-flag"))) {
  throw new Error("Private country flag internals must not have a package export.");
}

const countryFlagJavaScript = readFileSync(
  resolve(repositoryRoot, "packages/ui/dist/internal/country-flags/CountryFlag.js"),
  "utf8"
);
if (!countryFlagJavaScript.includes("_country-flag-sprite-url.js")) {
  throw new Error("CountryFlag does not reference the emitted private sprite asset.");
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
