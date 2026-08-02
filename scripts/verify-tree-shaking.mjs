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

runBuild("tree-icon", "dist-tree-icon");
const iconJavaScript = readOutput("dist-tree-icon", ".js");
if (!iconJavaScript.includes("data-loading") || !iconJavaScript.includes("aria-hidden")) {
  throw new Error("The used IconButton implementation or Lucide icon was not found.");
}

runBuild("tree-checkbox", "dist-tree-checkbox");
const checkboxJavaScript = readOutput("dist-tree-checkbox", ".js");
if (
  !checkboxJavaScript.includes("Tree-shaken checkbox")
  || !checkboxJavaScript.includes("checkbox")
) {
  throw new Error("The used Checkbox implementation was not found.");
}
if (checkboxJavaScript.includes("role=\"switch\"") || checkboxJavaScript.includes("radio-group-")) {
  throw new Error("Unused Switch or RadioGroup behavior survived the Checkbox-only build.");
}
if (iconJavaScript.includes("Trash2") || iconJavaScript.includes("CashRegister")) {
  throw new Error("Unused icon catalog entries survived the Lucide-only build.");
}

runBuild("tree-link", "dist-tree-link");
const linkJavaScript = readOutput("dist-tree-link", ".js");
if (!linkJavaScript.includes("/orders")) {
  throw new Error("The used ButtonLink implementation was not found in the bundle.");
}
if (linkJavaScript.includes("data-loading")) {
  throw new Error("Button-only loading behavior survived the ButtonLink-only build.");
}

runBuild("tree-spinner", "dist-tree-spinner");
const spinnerJavaScript = readOutput("dist-tree-spinner", ".js");
if (!spinnerJavaScript.includes("data-spinner") || !spinnerJavaScript.includes("status")) {
  throw new Error("The used standalone Spinner implementation was not found.");
}
if (spinnerJavaScript.includes("data-loading")) {
  throw new Error("Button loading behavior survived the Spinner-only build.");
}

runBuild("tree-amount", "dist-tree-amount");
const amountJavaScript = readOutput("dist-tree-amount", ".js");
if (!amountJavaScript.includes("data-amount-part")) {
  throw new Error("The used Amount implementation was not found.");
}
if (amountJavaScript.toLowerCase().includes("maskito")) {
  throw new Error("Maskito editing code survived the Amount-only build.");
}

runBuild("tree-number-input", "dist-tree-number-input");
const numberInputJavaScript = readOutput("dist-tree-number-input", ".js");
if (!numberInputJavaScript.includes("spinbutton")) {
  throw new Error("The used NumberInput implementation was not found.");
}
if (
  numberInputJavaScript.includes("data-amount-part")
  || numberInputJavaScript.includes("Tree-shaken quantity")
) {
  throw new Error("Amount or retail-ui survived the NumberInput-only build.");
}

runBuild("tree-international-phone-input", "dist-tree-international-phone-input");
const phoneInputJavaScript = readOutput("dist-tree-international-phone-input", ".js");
if (
  !phoneInputJavaScript.includes("Tree-shaken international phone")
  || !phoneInputJavaScript.includes("listbox")
) {
  throw new Error("InternationalPhoneInput or its country picker was not found.");
}
if (phoneInputJavaScript.includes("data-amount-part")) {
  throw new Error("Amount survived the InternationalPhoneInput-only build.");
}

runBuild("tree-quantity-input", "dist-tree-quantity-input");
const quantityInputJavaScript = readOutput("dist-tree-quantity-input", ".js");
if (
  !quantityInputJavaScript.includes("Tree-shaken quantity")
  || !quantityInputJavaScript.includes("spinbutton")
) {
  throw new Error("QuantityInput or its required NumberInput was not found.");
}
if (quantityInputJavaScript.includes("data-amount-part")) {
  throw new Error("Amount survived the QuantityInput-only build.");
}

runBuild("lazy", "dist-lazy");
const manifest = JSON.parse(
  readFileSync(resolve(consumerRoot, "dist-lazy", ".vite", "manifest.json"), "utf8")
);
const hasDynamicEntry = Object.values(manifest).some((entry) => entry.isDynamicEntry);
if (!hasDynamicEntry) {
  throw new Error("Dynamic @mypoint/ui/button import did not produce an async chunk.");
}

runBuild("lazy-button-link", "dist-lazy-button-link");
const buttonLinkManifest = JSON.parse(
  readFileSync(
    resolve(consumerRoot, "dist-lazy-button-link", ".vite", "manifest.json"),
    "utf8"
  )
);
const hasButtonLinkDynamicEntry = Object.values(buttonLinkManifest).some(
  (entry) => entry.isDynamicEntry
);
if (!hasButtonLinkDynamicEntry) {
  throw new Error(
    "Dynamic @mypoint/ui/button-link import did not produce an async chunk."
  );
}

console.log(
  "Tree-shaking passed: Amount excluded Maskito; ButtonLink/IconButton/Spinner stayed independent, unused ThemeProvider and icon catalog were removed, CSS retained, dynamic subpaths split."
);
